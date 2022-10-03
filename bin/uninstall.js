import { RDSClient, DeleteDBInstanceCommand } from '@aws-sdk/client-rds';
import { SSMClient, DeleteParameterCommand } from '@aws-sdk/client-ssm';
import { IAMClient, DeleteRoleCommand } from '@aws-sdk/client-iam';
import { S3Client, DeleteBucketCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import { CloudFormationClient, DeleteStackCommand } from '@aws-sdk/client-cloudformation';
import { EC2Client, RevokeSecurityGroupIngressCommand } from '@aws-sdk/client-ec2';
import { CloudFrontClient, DeleteDistributionCommand, GetDistributionCommand, DeleteCloudFrontOriginAccessIdentityCommand, UpdateDistributionCommand, waitUntilDistributionDeployed, GetCloudFrontOriginAccessIdentityCommand } from '@aws-sdk/client-cloudfront';

import { ask } from './tool.js';
import { asyncForEach } from './tool.js';
import path from 'path';
import fs from 'fs';

export default async function (awaytoId, { deleteRole, deleteOai }) {

  const rdsClient = new RDSClient();
  const ssmClient = new SSMClient();
  const iamClient = new IAMClient();
  const ec2Client = new EC2Client();
  const s3Client = new S3Client();
  const cfClient = new CloudFormationClient();
  const clClient = new CloudFrontClient();

  const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));

  // console.log('Warning! This is a destructive action and cannot be undone. All Awayto resources will be deleted, including buckets, lambdas, stacks, parameters, and dbs.')
  // const awaytoId = await ask('Awayto ID to Uninstall:\n> ');
  // const deleteRole = await ask('Delete LambdaTrust role (0)?\n0. No\n1. Yes\n> ') || '0';
  // const deleteOai = await ask('Delete AwaytoOAI distribution OAI (0)?\n0. No\n1. Yes\n> ') || '0';

  let seedFile;

  try {
    seedFile = fs.readFileSync(path.resolve(__dirname, `data/seeds/${awaytoId}.json`));
  } catch (error) { }

  let seed = seedFile ? JSON.parse(seedFile) : {};

  if (!awaytoId) {
    console.log('no awaytoId found!');
  } else {
    try {
      const delStack = await cfClient.send(new DeleteStackCommand({ StackName: awaytoId }));
      console.log('Stack deletion request-awaytoId: ' + delStack.$metadata.requestId);
    } catch (error) {
      console.log('Failed to delete cf stack', error);
    }

    try {
      const delDb = await rdsClient.send(new DeleteDBInstanceCommand({ DBInstanceIdentifier: awaytoId, SkipFinalSnapshot: true }));
      console.log('Db deletion request-awaytoId: ' + delDb.$metadata.requestId);
    } catch (error) {
      console.log('Failed to delete db', error);
    }

    let disableWebappDist, disableLandingDist;
    if (seed.webDistributionId) {
      try {
        console.log('Disabling Webapp CloudFront distribution.');
        const getDist = await clClient.send(new GetDistributionCommand({ Id: seed.webDistributionId }));
        getDist.Distribution.DistributionConfig.Enabled = false;
        disableWebappDist = await clClient.send(new UpdateDistributionCommand({
          IfMatch: getDist.ETag,
          Id: seed.webDistributionId,
          DistributionConfig: getDist.Distribution.DistributionConfig
        }));
      } catch (error) {
        console.log('Failed to delete webapp distribution', error);
      }
    }

    if (seed.landingDistributionId) {
      try {
        console.log('Disabling Landing CloudFront distribution.');
        const getDist = await clClient.send(new GetDistributionCommand({ Id: seed.landingDistributionId }));
        getDist.Distribution.DistributionConfig.Enabled = false;
        disableLandingDist = await clClient.send(new UpdateDistributionCommand({
          IfMatch: getDist.ETag,
          Id: seed.landingDistributionId,
          DistributionConfig: getDist.Distribution.DistributionConfig
        }));
      } catch (error) {
        console.log('Failed to delete landing distribution', error);
      }
    }

    if (seed.webDistributionId) {
      await waitUntilDistributionDeployed({ client: clClient, maxWaitTime: 600 }, { Id: seed.webDistributionId });
      const delWebappDist = await clClient.send(new DeleteDistributionCommand({ Id: seed.webDistributionId, IfMatch: disableWebappDist.ETag }));
      console.log('Webapp Dist deletion request-awaytoId: ' + delWebappDist.$metadata.requestId);
    }

    if (seed.landingDistributionId) {
      await waitUntilDistributionDeployed({ client: clClient, maxWaitTime: 600 }, { Id: seed.landingDistributionId });
      const delLandingDist = await clClient.send(new DeleteDistributionCommand({ Id: seed.landingDistributionId, IfMatch: disableLandingDist.ETag }));
      console.log('Landing Dist deletion request-awaytoId: ' + delLandingDist.$metadata.requestId);
    }
    
    try {
      await ssmClient.send(new DeleteParameterCommand({ Name: 'PGHOST_' + awaytoId }));
      await ssmClient.send(new DeleteParameterCommand({ Name: 'PGPORT_' + awaytoId }));
      await ssmClient.send(new DeleteParameterCommand({ Name: 'PGUSER_' + awaytoId }));
      await ssmClient.send(new DeleteParameterCommand({ Name: 'PGPASSWORD_' + awaytoId }));
      await ssmClient.send(new DeleteParameterCommand({ Name: 'PGDATABASE_' + awaytoId }));
      console.log('Deleted ssm parameters.');
    } catch (error) {
      console.log('Failed to delete ssm parameters.', error);
    }

    try {
      console.log('Clearing s3 bucket files and buckets.');
      const lambdaBucket = await s3Client.send(new ListObjectsCommand({ Bucket: awaytoId + '-lambda' }));

      await asyncForEach(lambdaBucket.Contents, async c => {
        await s3Client.send(new DeleteObjectCommand({ Bucket: awaytoId + '-lambda', Key: c.Key }));
      })

      const webappBucket = await s3Client.send(new ListObjectsCommand({ Bucket: awaytoId + '-webapp' }));

      await asyncForEach(webappBucket.Contents, async c => {
        await s3Client.send(new DeleteObjectCommand({ Bucket: awaytoId + '-webapp', Key: c.Key }));
      })

      const filesBucket = await s3Client.send(new ListObjectsCommand({ Bucket: awaytoId + '-files' }));

      await asyncForEach(filesBucket.Contents, async c => {
        await s3Client.send(new DeleteObjectCommand({ Bucket: awaytoId + '-files', Key: c.Key }));
      })

      await s3Client.send(new DeleteBucketCommand({ Bucket: awaytoId + '-lambda' }));
      await s3Client.send(new DeleteBucketCommand({ Bucket: awaytoId + '-webapp' }));
      await s3Client.send(new DeleteBucketCommand({ Bucket: awaytoId + '-files' }));

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
      fs.rmSync(path.resolve(__dirname, `data/seeds/${awaytoId}.json`))
    } catch (error) { }

    if (deleteRole) {
      try {
        await iamClient.send(new DeleteRoleCommand({ RoleName: 'LambdaTrust' }));
        console.log('Deleted LambaTrust role.');
      } catch (error) {
        console.log('Failed to delete LambdaTrust', error);
      }
    }

    if (seed.oaiId && deleteOai) {
      try {
        const getOai = await clClient.send(new GetCloudFrontOriginAccessIdentityCommand({ Id: seed.oaiId }));
        const delOaiRequest = await clClient.send(new DeleteCloudFrontOriginAccessIdentityCommand({ Id: seed.oaiId, IfMatch: getOai.ETag }))
        console.log('Oai deletion request-awaytoId: ' + delOaiRequest.$metadata.requestId);
      } catch (error) {
        console.log('Failed to delete oai -- There are still distributions using the AwaytoOAI. Wait for them to be deleted, or manually delete them in the CloudFront UI.', error);
      }
    }

    console.log(awaytoId + ' successfully uninstalled!');
  }

  process.exit()
}