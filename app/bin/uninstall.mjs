import { RDSClient, DeleteDBInstanceCommand } from '@aws-sdk/client-rds';
import { SSMClient, DeleteParameterCommand } from '@aws-sdk/client-ssm';
import { IAMClient, DeleteRoleCommand } from '@aws-sdk/client-iam';
import { S3Client, DeleteBucketCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { CloudFormationClient, DeleteStackCommand } from '@aws-sdk/client-cloudformation';
import { EC2Client, RevokeSecurityGroupIngressCommand } from '@aws-sdk/client-ec2';
import { CloudFrontClient, DeleteDistributionCommand, GetDistributionCommand, DeleteCloudFrontOriginAccessIdentityCommand, UpdateDistributionCommand, waitUntilDistributionDeployed, GetCloudFrontOriginAccessIdentityCommand } from '@aws-sdk/client-cloudfront';

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
const clClient = new CloudFrontClient();

export default async function () {

  const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));

  console.log('Warning! This is a destructive action and cannot be undone. All Awayto resources will be deleted, including buckets, lambdas, stacks, parameters, and dbs.')
  const id = await ask('Awayto ID to Uninstall:\n> ');
  const delRole = await ask('Delete LambdaTrust role (0)?\n0. No\n1. Yes\n> ') || '0';
  const delOai = await ask('Delete AwaytoOAI distribution OAI (0)?\n0. No\n1. Yes\n> ') || '0';

  let seedFile;

  try {
    seedFile = fs.readFileSync(path.resolve(__dirname, `data/seeds/${id}.json`));
  } catch (error) { }

  let seed = seedFile ? JSON.parse(seedFile) : {};

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

    if (seed.webDistributionId) {
      try {
        const getDist = await clClient.send(new GetDistributionCommand({ Id: seed.webDistributionId }));
        getDist.Distribution.DistributionConfig.Enabled = false;
        const disableDist = await clClient.send(new UpdateDistributionCommand({
          IfMatch: getDist.ETag,
          Id: seed.webDistributionId,
          DistributionConfig: getDist.Distribution.DistributionConfig
        }));
        console.log('Disabling CloudFront distribution (~5-10 mins).');
        await waitUntilDistributionDeployed({ client: clClient, maxWaitTime: 600 }, { Id: seed.webDistributionId });
        const delDist = await clClient.send(new DeleteDistributionCommand({ Id: seed.webDistributionId, IfMatch: disableDist.ETag }));
        console.log('Dist deletion request-id: ' + delDist.$metadata.requestId);
      } catch (error) {
        console.log('Failed to delete distribution', error);
      }
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
        await s3Client.send(new DeleteObjectCommand({ Bucket: id + '-webapp', Key: c.Key }));
      })

      const filesBucket = await s3Client.send(new ListObjectsCommand({ Bucket: id + '-files' }));

      await asyncForEach(filesBucket.Contents, async c => {
        await s3Client.send(new DeleteObjectCommand({ Bucket: id + '-files', Key: c.Key }));
      })

      await s3Client.send(new DeleteBucketCommand({ Bucket: id + '-lambda' }));
      await s3Client.send(new DeleteBucketCommand({ Bucket: id + '-webapp' }));
      await s3Client.send(new DeleteBucketCommand({ Bucket: id + '-files' }));

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

    if (delRole == '1') {
      try {
        await iamClient.send(new DeleteRoleCommand({ RoleName: 'LambdaTrust' }));
        console.log('Deleted LambaTrust role.');
      } catch (error) {
        console.log('Failed to delete LambdaTrust', error);
      }
    }

    if (seed.oaiId && delOai == '1') {
      try {
        const getOai = await clClient.send(new GetCloudFrontOriginAccessIdentityCommand({ Id: seed.oaiId }));
        const delOai = await clClient.send(new DeleteCloudFrontOriginAccessIdentityCommand({ Id: seed.oaiId, IfMatch: getOai.ETag }))
        console.log('Oai deletion request-id: ' + delOai.$metadata.requestId);
      } catch (error) {
        console.log('Failed to delete oai -- There are still distributions using the AwaytoOAI. Wait for them to be deleted, or manually delete them in the CloudFront UI.', error);
      }
    }

    console.log(id + ' successfully uninstalled!');
  }

  process.exit()
}