import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import { URL } from 'url';



import { RDSClient, waitUntilDBInstanceAvailable, ModifyDBInstanceCommand, CreateDBInstanceCommand, DescribeOrderableDBInstanceOptionsCommand, DescribeDBInstancesCommand, RestoreDBClusterFromS3Command, RestoreDBInstanceFromDBSnapshotCommand } from '@aws-sdk/client-rds';
import { EC2Client, DescribeAvailabilityZonesCommand, AuthorizeSecurityGroupIngressCommand } from '@aws-sdk/client-ec2'
import { SSMClient, DescribeParametersCommand, PutParameterCommand } from '@aws-sdk/client-ssm';
import { IAMClient, GetRoleCommand, CreateRoleCommand, AttachRolePolicyCommand } from '@aws-sdk/client-iam';
import { S3Client, PutBucketPolicyCommand, CreateBucketCommand, ListBucketsCommand, PutObjectCommand, PutBucketWebsiteCommand, GetBucketWebsiteCommand } from '@aws-sdk/client-s3';
import { CloudFormationClient, CreateStackCommand, DescribeStacksCommand, ListStackResourcesCommand } from '@aws-sdk/client-cloudformation';
import { LambdaClient, GetFunctionConfigurationCommand, UpdateFunctionConfigurationCommand, InvokeCommand, GetFunctionCommand } from '@aws-sdk/client-lambda';
import { CloudFrontClient, CreateDistributionCommand, CreateCloudFrontOriginAccessIdentityCommand } from '@aws-sdk/client-cloudfront';

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
const clClient = new CloudFrontClient();

export default async function () {
  const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));

  const domain = 'awaytodev1635081399524-webapp';

  let oai;
  
  try {
    oai = await clClient.send(new CreateCloudFrontOriginAccessIdentityCommand({
      CloudFrontOriginAccessIdentityConfig: {
        CallerReference: 'AwaytoOAI',
        Comment: 'AwaytoOAI',
      }
    }));
    console.log('using from create');
  } catch (error) {
    console.log('errored out');
    const oais = await clClient.send(new ListCloudFrontOriginAccessIdentitiesCommand());
    oai = oais.CloudFrontOriginAccessIdentityList.Items.filter(oai => oai.Comment == 'AwaytoOAI')[0];
  }

  console.log('you got an OAI of', oai);

  try {

    // create this oai

  //   const oai = await clClient.send(new CreateCloudFrontOriginAccessIdentityCommand({
  //     CloudFrontOriginAccessIdentityConfig: {
  //       CallerReference: 'awaytodev1635081399524',
  //       Comment: 'Created by system',
  //     }
  //   }))

  //   console.log('got a ting', oai.CloudFrontOriginAccessIdentity);

  //   await new Promise(res => setTimeout(res, 10000));

  //   const policy = `{
  //     "Version": "2012-10-17",
  //     "Id": "PolicyForCloudFrontPrivateContent",
  //     "Statement": [
  //         {
  //             "Effect": "Allow",
  //             "Principal": {
  //                 "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${oai.CloudFrontOriginAccessIdentity.Id}"
  //             },
  //             "Action": "s3:GetObject",
  //             "Resource": "arn:aws:s3:::${domain}/*"
  //         }
  //     ]
  // }`

  //   console.log('were going to push this policy', policy);

  //   // add policy to bucket
  //   await s3Client.send(new PutBucketPolicyCommand({
  //     Bucket: domain,
  //     Policy: policy
  //   }))

    // console.log('jso', JSON.stringify(oai, null, 2));

    // oai.CloudFrontOriginAccessIdentity.Id

    // await clClient.send(new CreateDistributionCommand({
    //   DistributionConfig: {
    //     CallerReference: 'awaytodev1635069027781',
    //     Comment: "Created by system",
    //     Enabled: true,
    //     Origins: {
    //       Items: [
    //         {
    //           Id: 'S3-' + domain,
    //           DomainName: domain + '.s3.amazonaws.com',
    //           S3OriginConfig: {
    //             OriginAccessIdentity: 'origin-access-identity/cloudfront/EZIVZHHRDZ0KO',
    //           }
    //         }
    //       ],
    //       Quantity: 1
    //     },
    //     CustomErrorResponses: {
    //       Items: [
    //         {
    //           ErrorCode: 403,
    //           ErrorCachingMinTTL: 10,
    //           ResponseCode: 200,
    //           ResponsePagePath: '/index.html'
    //         }
    //       ],
    //       Quantity: 1
    //     },
    //     DefaultCacheBehavior: {
    //       AllowedMethods: {
    //         Items: ['GET', 'HEAD'],
    //         Quantity: 2
    //       },
    //       CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // CachingOptimized ID
    //       TargetOriginId: 'S3-' + domain,
    //       TrustedSigners: { Enabled: false, Quantity: 0 },
    //       ViewerProtocolPolicy: "redirect-to-https"
    //     },
    //     DefaultRootObject: "index.html",
    //   }
    // }));

    // const id = 'booooadskjllsdkfjds'

    // fs.copyFileSync(path.join(__dirname, 'data/template.yaml.template'), path.join(__dirname, 'data/template.yaml'))
    // fs.copyFileSync(path.join(__dirname, 'data/template.yaml.template'), path.resolve(process.cwd(), 'template.sam.yaml'))

    // await replaceText(path.join(__dirname, 'data/template.yaml'), 'id', id);
    // await replaceText(path.resolve(process.cwd(), 'template.sam.yaml'), 'id', id);

    // await replaceText(path.join(__dirname, 'data/template.yaml'), 'storageSite', `'s3://${id}-lambda/lambda.zip'`);
    // await replaceText(path.resolve(process.cwd(), 'template.sam.yaml'), 'storageSite', `'.'`);


    process.exit();

    // const id = 'awaytodev1634930427304'

    // console.log('Updating DB password.');
    // await rdsClient.send(new ModifyDBInstanceCommand({
    //   DBInstanceIdentifier: id,
    //   MasterUserPassword: 'Testerpass4!',
    //   ApplyImmediately: true,

    // }));
    // console.log('Waiting for DB to be ready.');
    // await waitUntilDBInstanceAvailable({ client: rdsClient, maxWaitTime: 60 }, { DBInstanceIdentifier: id });

    // console.log('This should never be waiting for pass');
    // await pollDBStatusAvailable(id);


    const awaytoConfig = {
      functionName: 'dev-us-east-1-awaytodev1634926372299Resource'
    }

    const lamREs = await lamClient.send(new InvokeCommand({
      FunctionName: awaytoConfig.functionName,
      InvocationType: 'Event',
      Payload: makeLambdaPayload({
        "httpMethod": "GET",
        "resource": "/{proxy+}",
        "pathParameters": {
          "proxy": "deploy"
        },
        "body": {}
      })
    }));

    console.log(JSON.stringify(lamREs));


    const lamFun = await lamClient.send(new UpdateFunctionConfigurationCommand({
      FunctionName: awaytoConfig.functionName,
      VpcConfig: {
        SubnetIds: [res.DBSubnetGroup.Subnets[0].SubnetIdentifier],
        SecurityGroupIds: [res.VpcSecurityGroups[0].VpcSecurityGroupId]
      }
    }));

    console.log(JSON.stringify(await lamClient.send(new GetFunctionCommand({ FunctionName: awaytoConfig.functionName }))));
    console.log(JSON.stringify(await lamClient.send(new GetFunctionCommand({ FunctionName: awaytoConfig.functionName }))));
    console.log(JSON.stringify(await lamClient.send(new GetFunctionCommand({ FunctionName: awaytoConfig.functionName }))));
    console.log(JSON.stringify(await lamClient.send(new GetFunctionCommand({ FunctionName: awaytoConfig.functionName }))));


    // const content = {
    //   name:  await ask('Name?'),
    //   description:  await ask('Description?')
    // }

    // console.log('boop', content);


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



const pollDBStatusAvailable = (id) => {

  const loader = makeLoader();
  const describeCommand = new DescribeDBInstancesCommand({
    DBInstanceIdentifier: id
  });

  let i = 0;

  const executePoll = async (resolve, reject) => {
    try {
      const response = await rdsClient.send(describeCommand);
      const instance = response.DBInstances[0];

      console.log(instance.DBInstanceStatus);


      i++;
      if (instance.DBInstanceStatus.toLowerCase() == 'resetting-master-credentials') {
        console.log('it took ', i, 'attempts');
        clearInterval(loader);
        process.stdout.write("\r\x1b[K")
        return resolve(instance);
      } else {
        setTimeout(executePoll, 10000, resolve, reject);
      }
    } catch (error) {
      return reject(error);
    }
  }

  return new Promise(executePoll);
};

const makeLoader = () => {
  let counter = 1;
  return setInterval(function () {
    process.stdout.write("\r\x1b[K")
    process.stdout.write(`${counter % 2 == 0 ? '-' : '|'}`);
    counter++;
  }, 250)
}