import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import archiver from 'archiver';
import child_process from 'child_process';
import publicIp from 'public-ip';
import { URL } from 'url';

import { CognitoIdentityProviderClient, AddCustomAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';
import { RDSClient, waitUntilDBInstanceAvailable, ModifyDBInstanceCommand, CreateDBInstanceCommand, DescribeOrderableDBInstanceOptionsCommand, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { EC2Client, DescribeAvailabilityZonesCommand, AuthorizeSecurityGroupIngressCommand } from '@aws-sdk/client-ec2'
import { SSMClient, PutParameterCommand } from '@aws-sdk/client-ssm';
import { IAMClient, GetRoleCommand, CreateRoleCommand, AttachRolePolicyCommand } from '@aws-sdk/client-iam';
import { S3Client, CreateBucketCommand, PutObjectCommand, PutBucketWebsiteCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import { CloudFormationClient, waitUntilStackCreateComplete, CreateStackCommand, DescribeStacksCommand, ListStackResourcesCommand } from '@aws-sdk/client-cloudformation';
import { LambdaClient, waitUntilFunctionUpdated, GetFunctionConfigurationCommand, UpdateFunctionConfigurationCommand, InvokeCommand } from '@aws-sdk/client-lambda';

import { ask, replaceText, asyncForEach, makeLambdaPayload } from './tool.mjs';
import regions from './data/regions.mjs';
import createAccount from './createAccount.mjs';

const cipClient = new CognitoIdentityProviderClient();
const rdsClient = new RDSClient();
const ec2Client = new EC2Client();
const ssmClient = new SSMClient();
const iamClient = new IAMClient();
const s3Client = new S3Client();
const cfClient = new CloudFormationClient();
const lamClient = new LambdaClient();

export default async function () {

  const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));

  const config = {
    name: await ask('Project Name (\'awayto\'):\n> ', null, /^[a-zA-Z0-9]*$/) || 'awayto',
    description: await ask('Project Description (\'Awayto is a workflow enhancing platform, producing great value with minimal investment.\'):\n> ') || 'Awayto is a workflow enhancing platform, producing great value with minimal investment.',
    environment: await ask('Environment (\'dev\'):\n> ') || 'dev',
    username: await ask('Admin/DB Username (\'awaytoadmin\'):\n> ') || 'awaytoadmin',
    password: await ask('Admin/DB Password [8 char min] (\'Tester1!\'):\n> ', /[@"\/]/) || 'Tester1!',
    email: await ask('Admin Email (\'install@keybittech.com\'):\n> ') || 'install@keybittech.com',
    localTesting: (await ask(`Setup local testing? (WARNING! This will make your DB "public", create an ingress rule in the security group to allow this computer's public IP in AWS, and store the (gitignored) db credentials file in plaintext in this folder. Only enable if you know what you're doing! (0. No):\n0.No\n1.Yes\n> `) || '0') == '1',
    regionId: await ask(`${regions.map((r, i) => `${i}. ${r}`).join('\n')}\nChoose a number (0. us-east-1):\n> `) || '0',
  };

  const region = regions[parseInt(config.regionId)];

  const { AvailabilityZones } = await ec2Client.send(new DescribeAvailabilityZonesCommand({
    Filters: [{
      Name: 'region-name',
      Values: [region]
    }]
  }));
  const { ZoneName } = AvailabilityZones[await ask(`${AvailabilityZones.map((r, i) => `${i}. ${r.ZoneName}`).join('\n')}\nChoose a number (0. default):\n> `) || '0']

  // Generate uuids
  const seed = (new Date).getTime();
  const id = `${config.name}${config.environment}${seed}`;
  const username = config.username;
  const password = config.password;

  console.log('== Beginning Awayto Install (~5 - 10 minutes): ' + id);

  // Create Amazon RDS instance
  const createRdsInstance = async () => {

    console.log('Beginning DB instance creation.');

    // TODO, expand on this to allow customization

    // // Get all available AWS db engines for Postgres
    // const instanceTypeCommand = new DescribeOrderableDBInstanceOptionsCommand({
    //   Engine: 'postgres',
    //   EngineVersion: '13.4',
    //   DBInstanceClass: 't3micro'
    // });


    // const instanceTypeResponse = await rdsClient.send(instanceTypeCommand);
    // console.log(instanceTypeResponse);

    // // We only want to create a t2.micro standard type DB as this is AWS free tier
    // const what = instanceTypeResponse.OrderableDBInstanceOptions.find(o => o.DBInstanceClass.includes('micro'));

    const createCommand = new CreateDBInstanceCommand({
      DBInstanceClass: 'db.t3.micro',
      DBInstanceIdentifier: id,
      Engine: 'postgres',
      EngineVersion: '13.4',
      AllocatedStorage: 10,
      MaxAllocatedStorage: 20,
      BackupRetentionPeriod: 0,
      DBName: id, // TODO custom name management; of multi db instances
      DeletionProtection: false,
      MasterUsername: username,
      MasterUserPassword: password,
      PubliclyAccessible: config.localTesting,
      AvailabilityZone: ZoneName
    });

    // Start DB creation -- will take time to fully generate
    await rdsClient.send(createCommand);

  }

  await createRdsInstance();

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
      Value: 'tempvalue',
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
      Value: username,
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

  // Create two template files
  // template.yaml will go to CloudFormation for actual deployment
  // template.sam.yaml is used in the deployed file structure to run SAM local

  fs.copyFileSync(path.join(__dirname, 'data/template.yaml.template'), path.join(__dirname, 'data/template.yaml'))
  fs.copyFileSync(path.join(__dirname, 'data/template.yaml.template'), path.resolve(process.cwd(), 'template.sam.yaml'))

  await replaceText(path.join(__dirname, 'data/template.yaml'), 'id', id);
  await replaceText(path.resolve(process.cwd(), 'template.sam.yaml'), 'id', id);

  await replaceText(path.join(__dirname, 'data/template.yaml'), 'storageSite', `'s3://${id}-lambda/lambda.zip'`);
  await replaceText(path.resolve(process.cwd(), 'template.sam.yaml'), 'storageSite', `'./apipkg'`);

  // Create two S3 buckets and put src/api/scripts/lambda.zip in one:
  // s3://<some-name>-lambda/lambda.zip
  // s3://<some-name>-webapp

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

  console.log('Deploying CloudFormation stack.');
  await waitUntilStackCreateComplete({ client: cfClient, maxWaitTime: 300 }, { StackName: id });

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
    environment: config.environment,
    seed,
    awsRegion: region,
    functionName: resources[id + 'Resource'],
    cognitoUserPoolId: resources['CognitoUserPool'],
    cognitoClientId: resources['CognitoUserPoolClient'],
    apiGatewayEndpoint: `https://${resources[id + 'ResourceApi']}.execute-api.${region}.amazonaws.com/${resources[id + 'ResourceApiStage']}/`,
    website: `http://${id + '-webapp'}.s3-website.${region}.amazonaws.com`
  }

  console.log('Adding role attribute to Cognito.');
  await cipClient.send(new AddCustomAttributesCommand({
    UserPoolId: resources['CognitoUserPool'],
    CustomAttributes: [
      {
        AttributeDataType: 'String',
        Name: 'admin',
        Mutable: true
      }
    ]
  }));

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
    'settings.local.env',
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
    'settings.local.env',
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
    child_process.execSync(`npm run build-deploy`);
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

    output.on('close', async function () {
      child_process.execSync(`aws s3 cp ./lambda.zip s3://${id + '-lambda'}`);
      child_process.execSync(`aws lambda update-function-code --function-name ${config.environment}-${region}-${id}Resource --region ${region} --s3-bucket ${id + '-lambda'} --s3-key lambda.zip`);
      child_process.execSync(`rm lambda.zip`);

      console.log('Waiting for DB to be ready.');
      await waitUntilDBInstanceAvailable({ client: rdsClient, maxWaitTime: 60 }, { DBInstanceIdentifier: id });

      const describeCommand = new DescribeDBInstancesCommand({
        DBInstanceIdentifier: id
      });

      const dbInsRes = await rdsClient.send(describeCommand);
      const dbInstance = dbInsRes.DBInstances[0];

      if (config.localTesting) {
        try {
          const ip4 = await publicIp.v4();
          const { SecurityGroupRules } = await ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
            CidrIp: `${ip4}/32`,
            FromPort: 5432,
            ToPort: 5432,
            IpProtocol: 'TCP',
            GroupName: 'default',
            GroupId: dbInstance.VpcSecurityGroups[0].VpcSecurityGroupId,
          }));

          awaytoConfig.ruleId = SecurityGroupRules[0].SecurityGroupRuleId;
          console.log('Created a security group rule for this computer to access the default security group (and therefore the DB).');
        } catch (error) {
          awaytoConfig.ruleId = 'existing';
          console.log('Skipped security group rule creation as it already exists for this computer.');
        }
      }

      fs.writeFileSync(path.join(__dirname, `data/seeds/${awaytoConfig.awaytoId}.json`), JSON.stringify(awaytoConfig));
      console.log('Generated project seed.');

      const lamCfgCommand = await lamClient.send(new GetFunctionConfigurationCommand({
        FunctionName: awaytoConfig.functionName
      }));

      let envVars = Object.assign({}, lamCfgCommand.Environment.Variables);
      envVars['PGHOST'] = dbInstance.Endpoint.Address;

      await lamClient.send(new UpdateFunctionConfigurationCommand({
        FunctionName: awaytoConfig.functionName,
        Environment: {
          Variables: envVars
        },
        VpcConfig: {
          SubnetIds: [dbInstance.DBSubnetGroup.Subnets[0].SubnetIdentifier],
          SecurityGroupIds: [dbInstance.VpcSecurityGroups[0].VpcSecurityGroupId]
        }
      }));

      await waitUntilFunctionUpdated({ client: lamClient, maxWaitTime: 180 }, { FunctionName: awaytoConfig.functionName });

      await lamClient.send(new InvokeCommand({
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

      await ssmClient.send(new PutParameterCommand({
        Name: 'PGHOST_' + id,
        Value: dbInstance.Endpoint.Address,
        DataType: 'text',
        Type: 'String',
        Overwrite: true
      }));

      if (config.localTesting) {
        fse.copySync(path.resolve(__dirname, 'data/env.json.template'), path.resolve(process.cwd(), 'env.json'));
        const envJson = {
          "Environment": config.environment,
          "PGDATABASE": 'postgres',
          "PGPASSWORD": config.password,
          "PGHOST": dbInstance.Endpoint.Address,
          "PGPORT": 5432,
          "PGUSER": config.username
        }

        await asyncForEach(Object.keys(envJson), async k => {
          await replaceText(path.resolve(process.cwd(), 'env.json'), k, envJson[k]);
        })
      }

      await createAccount({
        poolId: awaytoConfig.cognitoUserPoolId,
        clientId: awaytoConfig.cognitoClientId,
        username: config.username,
        password: config.password,
        email: config.email
      });

      console.log(`Site available at ${awaytoConfig.website}.`)
      console.log('You may also run the project locally with "npm run start-stack". See the package for more options.');

      process.exit();
    });

    await archive.finalize();
  } catch (error) {
    console.log('api deploy failed', error)
  }

};