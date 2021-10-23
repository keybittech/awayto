import { RDSClient, DeleteDBInstanceCommand } from '@aws-sdk/client-rds';
import { SSMClient, DeleteParameterCommand } from '@aws-sdk/client-ssm';
import { IAMClient, DeleteRoleCommand } from '@aws-sdk/client-iam';
import { S3Client, DeleteBucketCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { CloudFormationClient, DeleteStackCommand } from '@aws-sdk/client-cloudformation';
import { EC2Client, RevokeSecurityGroupIngressCommand } from '@aws-sdk/client-ec2';

import { ask } from './tool.mjs';
import { asyncForEach } from './tool.mjs';
import path from 'path';
import fs from 'fs';

const rdsClient = new RDSClient();
const ssmClient = new SSMClient();
const iamClient = new IAMClient();
const ec2Client = new EC2Client();
const s3Client = new S3Client();
const cfClient = new CloudFormationClient();

export default async function () {

  const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));

  console.log('Warning! This is a destructive action and cannot be undone. All Awayto resources will be deleted, including buckets, lambdas, stacks, parameters, and dbs.')
  const id = await ask('Awayto ID to Uninstall:\n> ');
  const delRole = await ask('Delete LambdaTrust role (0)?\n0. No\n1. Yes\n> ') || '0';

  let seed = JSON.parse(fs.readFileSync(path.resolve(__dirname, `data/seeds/${id}.json`)));

  if (!id) {
    console.log('no id found!');
  } else {
    try {
      const delStack = await cfClient.send(new DeleteStackCommand({ StackName: id }));
      console.log('Stack deletion request-id: ' + delStack.$metadata.requestId);
    } catch (error) {
      console.log('Failed to delete cf stack', error);
    }

    try {
      const delDb = await rdsClient.send(new DeleteDBInstanceCommand({ DBInstanceIdentifier: id, SkipFinalSnapshot: true }));
      console.log('Db deletion request-id: ' + delDb.$metadata.requestId);
    } catch (error) {
      console.log('Failed to delete db', error);
    }

    try {
      await ssmClient.send(new DeleteParameterCommand({ Name: 'PGHOST_' + id }));
      await ssmClient.send(new DeleteParameterCommand({ Name: 'PGPORT_' + id }));
      await ssmClient.send(new DeleteParameterCommand({ Name: 'PGUSER_' + id }));
      await ssmClient.send(new DeleteParameterCommand({ Name: 'PGPASSWORD_' + id }));
      await ssmClient.send(new DeleteParameterCommand({ Name: 'PGDATABASE_' + id }));
      console.log('Deleted ssm parameters.');
    } catch (error) {
      console.log('Failed to delete ssm parameters.', error);
    }

    try {
      console.log('Clearing s3 bucket files and buckets.');
      const lambdaBucket = await s3Client.send(new ListObjectsCommand({ Bucket: id + '-lambda' }));
      
      await asyncForEach(lambdaBucket.Contents, async c => {
        await s3Client.send(new DeleteObjectCommand({ Bucket: id + '-lambda', Key: c.Key }));
      })
    
      const webappBucket = await s3Client.send(new ListObjectsCommand({ Bucket: id + '-webapp' }));
      
      await asyncForEach(webappBucket.Contents, async c => {
        await s3Client.send(new DeleteObjectCommand({ Bucket: id + '-webapp', Key: c.Key  }));
      })
    
      await s3Client.send(new DeleteBucketCommand({ Bucket: id + '-lambda' }));
      await s3Client.send(new DeleteBucketCommand({ Bucket: id + '-webapp' }));

    } catch (error) {
      console.log('Failed to delete s3 buckets.', error);
    }

    if (seed.ruleId) {
      if (seed.ruleId == 'existing') {
        console.log('This installation used an existing security group rule, and will not remove any. Be sure to check your default security group rules if needed.')
      } else {
        try {
          await ec2Client.send(new RevokeSecurityGroupIngressCommand({
            GroupName: 'default',
            SecurityGroupRuleIds: [seed.ruleId]
          }));
          console.log('Revoked ingress rules.');
        } catch (error) {
          console.log('Did not remove any ingress rules.', error);
        }
      }
    }

    try {
      fs.rmSync(path.resolve(__dirname, `data/seeds/${id}.json`))
    } catch (error) { }

    console.log(id + ' successfully uninstalled!');
  }

  if (delRole == '1') {
    try {
      // await iamClient.send(new DeleteRoleCommand({ RoleName: 'LambdaTrust' }));
      console.log('Deleted LambaTrust role.');
    } catch (error) {
      console.log('Failed to delete LambdaTrust', error);
    }
  }

  process.exit()
}