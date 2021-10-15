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
import { S3Client, CreateBucketCommand, ListBucketsCommand, PutObjectCommand, PutBucketWebsiteCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { CloudFormationClient, CreateStackCommand, DescribeStacksCommand, ListStackResourcesCommand } from '@aws-sdk/client-cloudformation';

import { ask, replaceText, asyncForEach } from './tool.mjs';
import regions from './data/regions.mjs';

const url = new URL(import.meta.url);
const __dirname = path.dirname(new URL(fs.realpathSync(url)).pathname);

const rdsClient = new RDSClient();
const ec2Client = new EC2Client();
const ssmClient = new SSMClient();
const iamClient = new IAMClient();
const s3Client = new S3Client();
const cfClient = new CloudFormationClient();

export default async function () {

  const config = {
    name: await ask('Project Name:\n> ') || 'awayto',
    description: await ask('Project Description:\n> ') || 'Awayto is a workflow enhancing platform, producing great value with minimal investment.',
    environment: await ask('Environment (\'dev\'):\n> ') || 'dev',
    password: await ask('DB Password 8 char min (\'postgres\'):\n> ', /[@"\/]/) || 'postgres',
    regionId: await ask(`${regions.map((r, i) => `${i}. ${r}`).join('\n')}\nChoose a number (0. us-east-1):\n> `) || '0'
  };

  const region = regions[parseInt(config.regionId)];

  const azCommand = new DescribeAvailabilityZonesCommand({
    Filters: [{
      Name: 'region-name',
      Values: [region]
    }]
  })

  const { AvailabilityZones } = await ec2Client.send(azCommand);
  const { ZoneName } = AvailabilityZones[await ask(`${AvailabilityZones.map((r, i) => `${i}. ${r.ZoneName}`).join('\n')}\nChoose a number (0. default):\n> `) || '0']

  // Generate uuids
  const seed = (new Date).getTime();
  const id = `${config.name}${config.environment}${seed}`;
  const password = config.password;

  console.log('== Beginning Awayto Install: ' + id);

  // Create Amazon RDS instance
  const createRdsInstance = async () => {

    //Configure DB instance
    const createCommand = new RestoreDBInstanceFromDBSnapshotCommand({
      AvailabilityZone: ZoneName,
      DBInstanceClass: 'db.t2.micro',
      DBInstanceIdentifier: id,
      DBSnapshotIdentifier: 'awayto-v001',
      DeletionProtection: false
    });

    // Start DB creation -- will take time to fully generate
    await rdsClient.send(createCommand);

    // console.log('Created a new DB Instance: ' + id + ' \nYou can undo this action with the following command: \n\naws rds delete-db-instance --db-instance-identifier ' + id + ' --skip-final-snapshot');

    console.log('Waiting for DB creation (~5-10 mins).'); // TODO -- refactor usage of SSM params to avoid "having" to wait for this
    await pollDBStatusAvailable(id);

  }

  await createRdsInstance();

  console.log('Updating DB password.');
  await rdsClient.send(new ModifyDBInstanceCommand({
    DBInstanceIdentifier: id,
    MasterUserPassword: password
  }));
  const dbInstance = await pollDBStatusAvailable(id);

  // Create SSM Parameters
  // Create the following string parameters in the Parameter Store:
  // PGDATABASE (postgres)
  // PGHOST
  // PGPASSWORD
  // PGPORT (5432)
  // PGUSER (postgres)

  const createSsmParameters = async () => {
    await ssmClient.send(new PutParameterCommand({
      Name: 'PGHOST_' + id,
      Value: dbInstance.Endpoint.Address.toString(),
      DataType: 'text',
      Type: 'String'
    }));
    await ssmClient.send(new PutParameterCommand({
      Name: 'PGPORT_' + id,
      Value: '5432',
      DataType: 'text',
      Type: 'String'
    }));
    await ssmClient.send(new PutParameterCommand({
      Name: 'PGUSER_' + id,
      Value: 'postgres',
      DataType: 'text',
      Type: 'String'
    }));
    await ssmClient.send(new PutParameterCommand({
      Name: 'PGPASSWORD_' + id,
      Value: password,
      DataType: 'text',
      Type: 'String'
    }));
    await ssmClient.send(new PutParameterCommand({
      Name: 'PGDATABASE_' + id,
      Value: 'postgres',
      DataType: 'text',
      Type: 'String'
    }));
  }

  console.log('Creating SSM parameters.');
  await createSsmParameters();

  // Create LambdaTrust IAM Role with following AWS-Managed policies:
  // AmazonS3FullAccess
  // CloudWatchLogsFullAccess
  // AmazonCognitoDeveloperAuthenticatedIdentities
  // AmazonCognitoPowerUser
  // AWSLambdaBasicExecutionRole
  // AWSIoTFullAccess
  // AWSConfigRulesExecutionRole
  // AWSLambdaVPCAccessExecutionRole

  const roleName = 'LambdaTrust';

  const createLambdaRole = async () => {
    try {

      await iamClient.send(new GetRoleCommand({
        RoleName: roleName
      }));

    } catch (error) {

      console.log('creating role ' + roleName);

      await iamClient.send(new CreateRoleCommand({
        RoleName: roleName,
        AssumeRolePolicyDocument: `{
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              },
              "Action": "sts:AssumeRole"
            }
          ]
        }`
      }));

      await iamClient.send(new AttachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: 'arn:aws:iam::aws:policy/AmazonS3FullAccess'
      }))

      await iamClient.send(new AttachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: 'arn:aws:iam::aws:policy/CloudWatchFullAccess'
      }))

      await iamClient.send(new AttachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: 'arn:aws:iam::aws:policy/AmazonCognitoDeveloperAuthenticatedIdentities'
      }))

      await iamClient.send(new AttachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: 'arn:aws:iam::aws:policy/AmazonCognitoPowerUser'
      }))

      await iamClient.send(new AttachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
      }))

      await iamClient.send(new AttachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: 'arn:aws:iam::aws:policy/AWSIoTFullAccess'
      }))

      await iamClient.send(new AttachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSConfigRulesExecutionRole'
      }))

      await iamClient.send(new AttachRolePolicyCommand({
        RoleName: roleName,
        PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole'
      }))

    }
  }

  console.log('Creating LambdaTrust role.');
  await createLambdaRole();

  // Create two S3 buckets and put src/api/scripts/lambda.zip in one:
  // s3://<some-name>-lambda/lambda.zip
  // s3://<some-name>-webapp

  fs.copyFileSync(path.join(__dirname, 'data/template.yaml.template'), path.join(__dirname, 'data/template.yaml'))
  await replaceText(path.join(__dirname, 'data/template.yaml'), 'id', id);

  await s3Client.send(new CreateBucketCommand({ Bucket: id + '-lambda' }));
  await s3Client.send(new CreateBucketCommand({ Bucket: id + '-webapp' }));
  await s3Client.send(new PutObjectCommand({
    Bucket: id + '-lambda',
    Key: 'lambda.zip',
    Body: fs.readFileSync(path.join(__dirname, 'data/lambda.zip'))
  }));
  await s3Client.send(new PutObjectCommand({
    Bucket: id + '-lambda',
    Key: 'template.yaml',
    Body: fs.readFileSync(path.join(__dirname, 'data/template.yaml'))
  }));

  await s3Client.send(new PutBucketWebsiteCommand({
    Bucket: id + '-webapp',
    WebsiteConfiguration: {
      IndexDocument: {
        Suffix: 'index.html'
      }
    }
  }))

  await s3Client.send(new PutBucketPolicyCommand({
    Bucket: id + '-webapp',
    Policy: `{
      "Version": "2008-10-17",
      "Statement": [
          {
              "Sid": "AllowPublicRead",
              "Effect": "Allow",
              "Principal": "*",
              "Action": "s3:GetObject",
              "Resource": "arn:aws:s3:::${id + '-webapp'}/*"
          }
      ]
    }`
  }))

  await cfClient.send(new CreateStackCommand({
    StackName: id,
    TemplateURL: 'https://' + id + '-lambda.s3.amazonaws.com/template.yaml',
    Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND'],
    OnFailure: 'DELETE',
    Parameters: [
      {
        ParameterKey: 'Environment',
        ParameterValue: 'dev'
      }
    ]
  }))

  console.log('Stack deploying: ' + id);

  await pollStackCreated(id);

  const resourceResponse = await cfClient.send(new ListStackResourcesCommand({ StackName: id }));

  const resources = resourceResponse.StackResourceSummaries.map(r => {
    return {
      [r.LogicalResourceId]: r.PhysicalResourceId
    };
  }).reduce((a, b) => Object.assign(a, b), {});

  const awaytoConfig = {
    awaytoId: id,
    name: config.name,
    description: config.description,
    awsRegion: region,
    cognitoUserPoolId: resources['CognitoUserPool'],
    cognitoClientId: resources['CognitoUserPoolClient'],
    apiGatewayEndpoint: `https://${resources[id + 'ResourceApi']}.execute-api.${region}.amazonaws.com/${resources[id + 'ResourceApiStage']}/`
  }

  const copyFiles = [
    'src',
    'public',
    'apipkg',
    '.env',
    '.babelrc',
    '.eslintignore',
    '.eslintrc',
    'api.paths.json',
    'api.ts.json',
    'api.webpack.js',
    'config-overrides.js',
    'package.json',
    'settings.application.env',
    'tsconfig.json',
    'tsconfig.paths.json'
  ];

  copyFiles.forEach(file => {
    fse.copySync(path.resolve(__dirname, `../app/${file}`), path.resolve(process.cwd(), file));
  })

  const tmplFiles = [
    '.gitignore',
    'public/index.html',
    'settings.development.env',
    'settings.production.env'
  ];

  tmplFiles.forEach(file => {
    fse.copySync(path.resolve(__dirname, `../app/${file}.template`), path.resolve(process.cwd(), file));
  })

  console.log('Applying properties to settings file.');

  const varFiles = [
    'package.json',
    'public/index.html',
    'public/manifest.json',
    'settings.development.env',
    'settings.production.env'
  ];

  await asyncForEach(varFiles, async file => {
    await asyncForEach(Object.keys(awaytoConfig), async cfg => {
      await replaceText(path.resolve(process.cwd(), file), cfg, awaytoConfig[cfg]);
    })
  });

  try {
    console.log('Performing npm install.')
    child_process.execSync(`npm i`);
    child_process.execSync(`npm i --prefix ./apipkg`);
  } catch (error) {
    console.log('npm install failed')
  }

  try {
    console.log('Building webapp and api.')
    child_process.execSync(`npm run build`);
  } catch (error) {
    console.log('webapp build failed')
  }

  try {
    console.log('Syncing webapp to S3.')
    child_process.execSync(`aws s3 sync ./build s3://${id + '-webapp'}`);
  } catch (error) {
    console.log('webapp sync failed')
  }

  try {
    console.log('Deploying api to Lambda.')

    const output = fs.createWriteStream('lambda.zip');
    const archive = archiver('zip');

    archive.on('error', function (error) {
      throw error;
    });

    archive.pipe(output);
    archive.directory('apipkg/', false);

    output.on('close', function() {
      child_process.execSync(`aws s3 cp ./lambda.zip s3://${id + '-lambda'}`);
      child_process.execSync(`aws lambda update-function-code --function-name ${config.environment}-${region}-${id}Resource --region ${region} --s3-bucket ${id + '-lambda'} --s3-key lambda.zip`);
      child_process.execSync(`rm lambda.zip`);

      console.log(`site available at http://${id + '-webapp'}.s3-website.${region}.amazonaws.com`)
      process.exit();
    });

    await archive.finalize();
  } catch (error) {
    console.log('api deploy failed')
  }

};

const pollStackCreated = (id) => {

  const loader = makeLoader();
  const describeCommand = new DescribeStacksCommand({
    StackName: id
  });

  const executePoll = async (resolve, reject) => {
    try {
      const response = await cfClient.send(describeCommand);
      const instance = response.Stacks[0];

      if (instance.StackStatus.toLowerCase() == 'create_complete') {
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
}

const pollDBStatusAvailable = (id) => {

  const loader = makeLoader();
  const describeCommand = new DescribeDBInstancesCommand({
    DBInstanceIdentifier: id
  });

  const executePoll = async (resolve, reject) => {
    try {
      const response = await rdsClient.send(describeCommand);
      const instance = response.DBInstances[0];

      if (instance.DBInstanceStatus.toLowerCase() == 'available') {
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



// Quick Installation
// Install Awayto: npm i -g @keybittech/awayto

// Unpack an Awayto instance in a new folder: npx awayto unpack


// --







// Rename #APP_NAME# to preferred name in src/api/scripts/template.yaml.

// Update the CodeUri property in template.yaml with the value s3://<some-name>-lambda/lambda.zip.

// In CloudFormation

// Create Stack (with new resources)

// Upload a template

// Select template.yaml

// Click Next

// Enter a Stack name and Environment

// Click Next x 2

// Acknowledge and Create Stack.

// Note Resource IDs:

// AWS Region: This is chosen when you make your AWS account. Ex: us-east-1

// User Pool ID: Found on the Cognito user pool details page. Ex: us-east-1_ABcdefGhi

// User Client ID: Found on the App clients sub-menu of the same page. Ex: 1abcdef2ghijklmnopqrs34tuvw56

// API Gateway ID: Found on the API Gateway main page. Ex: abcd1efg56

// API Endpoint: Found by entering the details of your API, visiting the Stages submenu, and then clicking on the stage named after the Environment name you used when creating your stack. You want the Invoke URL at the top of this area. Ex: https://abcd1efg56.execute-api.us-east-1.amazonaws.com/dev/

// Configure the local Awayto installation: npx awayto config

// npm start