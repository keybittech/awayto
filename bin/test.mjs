import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import archiver from 'archiver';
import child_process from 'child_process';
import { URL } from 'url';



import { RDSClient, ModifyDBInstanceCommand, CreateDBInstanceCommand, DescribeOrderableDBInstanceOptionsCommand, DescribeDBInstancesCommand, RestoreDBClusterFromS3Command, RestoreDBInstanceFromDBSnapshotCommand } from '@aws-sdk/client-rds';
import { EC2Client, DescribeAvailabilityZonesCommand } from '@aws-sdk/client-ec2'
import { SSMClient, DescribeParametersCommand, PutParameterCommand } from '@aws-sdk/client-ssm';
import { IAMClient, GetRoleCommand, CreateRoleCommand, AttachRolePolicyCommand } from '@aws-sdk/client-iam';
import { S3Client, CreateBucketCommand, ListBucketsCommand, PutObjectCommand, PutBucketWebsiteCommand, GetBucketWebsiteCommand } from '@aws-sdk/client-s3';
import { CloudFormationClient, CreateStackCommand, DescribeStacksCommand, ListStackResourcesCommand } from '@aws-sdk/client-cloudformation';
import { LambdaClient, GetFunctionConfigurationCommand, UpdateFunctionConfigurationCommand, InvokeCommand } from '@aws-sdk/client-lambda';

import { ask, replaceText, asyncForEach, makeLambdaPayload } from './tool.mjs';
import regions from './data/regions.mjs';
import { resolveCname } from 'dns';


const rdsClient = new RDSClient();
const ec2Client = new EC2Client();
const ssmClient = new SSMClient();
const iamClient = new IAMClient();
const s3Client = new S3Client();
const cfClient = new CloudFormationClient();
const lamClient = new LambdaClient();

export default async function() {

  try {

    const content = {
      name:  await ask('Name?'),
      description:  await ask('Description?')
    }

    console.log('boop', content);
  
    // const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));

    // const pathName = path.join(__dirname, "tester.mjs");

    // const cmd = child_process.spawn("node", [pathName], {
    //   spawn: true,
    //   detached: true,
    //   stdio: 'ignore',
    //   shell: true,
    // });

    // console.log('dthe path', path.resolve(__dirname, "./something.json"));

    // let nameEntry = '';

    // // cmd.stdin.on('data', data => {
    // //   nameEntry = data;
    // //   console.log(data);
    // // })

    // // cmd.stdout.on('data',  function(data) {
    // //   console.log('we responded with', data.toString('utf8'));
    // //   console.log('we responded errrr', Buffer.from(data).toString());
    // //   process.exit();
    // // })

    // // cmd.stderr.on('data',  function(err, res) {
    // //   console.log('we responded with', err);
    // //   console.log('we responded wisaddsafth', res);
    // // })
    
    process.exit();
  } catch (error) {
    console.log('err', error);
  }

  // const resp = await lamClient.send(new InvokeCommand({
  //   FunctionName: 'dev-us-east-1-kbtdevResource',
  //   InvocationType: 'Event',
  //   Payload: makeLambdaPayload({
  //     "httpMethod": "GET",
  //     "pathParameters": {
  //       "proxy": "deploy"
  //     },
  //     "body": {}
  //   })
  // }));
  
  // console.log(JSON.stringify(resp, null, 2));
  
  // const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));

  // fs.writeFileSync(path.join(__dirname, `/testerrrrrrrrrr.json`), '{}')
  
  // // http://bucket-name.s3-website.Region.amazonaws.com/object-name
  


  // const configur = {
  //   id: 'boop',
  //   beep: 'bop'
  // }

  // const createSeed = (config) => {
  //   fs.writeFileSync(path.resolve(__dirname + `/data/seeds/${config.id}.json`), JSON.stringify(config))
  //   process.exit();
  // }

  // createSeed(configur);


  // const output = fs.createWriteStream('lambda.zip');
  // const archive = archiver('zip');

  // // listen for all archive data to be written
  // // 'close' event is fired only when a file descriptor is involved
  // output.on('close', function() {
  //   console.log(archive.pointer() + ' total bytes');
  //   console.log('archiver has been finalized and the output file descriptor has closed.');
  //   process.exit();
  // });

  // // This event is fired when the data source is drained no matter what was the data source.
  // // It is not part of this library but rather from the NodeJS Stream API.
  // // @see: https://nodejs.org/api/stream.html#stream_event_end
  // output.on('end', function() {
  //   console.log('Data has been drained');
  // });

  // archive.on('error', function(error) {
  //   throw error;
  // });

  // archive.pipe(output);
  // archive.directory('apipkg/', false);
  // await archive.finalize();


  // const id = 'boo'

  // try {
  //   console.log(1);
  //   const buildChild = child_process.execSync(`npm run build`);
  // } catch (error) {
  //   console.log('first install failed');
  // }
  
  // console.log(2);
  // const buildChild2 = child_process.execSync(`npm run build`);
  

  // process.exit();

  // await s3Client.send(new CreateBucketCommand({ Bucket: id + '-webapptest2' }));

  // const bucketWebsiteCmd = await s3Client.send(new PutBucketWebsiteCommand({
  //   Bucket: id + '-webapptest2',
  //   WebsiteConfiguration: {
  //     IndexDocument: {
  //       Suffix: 'index.html'
  //     }
  //   }
  // }))

  // console.log(bucketWebsiteCmd);

  // const bkweb = await s3Client.send(new GetBucketWebsiteCommand({ Bucket: id + '-webapptest2' }) )

  // console.log(bkweb);
}

