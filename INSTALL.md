# Installation

```
npm i -g @keybittech/awayto
```

Make sure your console session can perform AWS CLI commands with Administrator role access. After restarting your console you can make a new folder or go into an existing folder and deploy an Awayto app.

```
mkdir proj
cd proj
awayto install <name> <environment> "<description>"
```

Then follow the prompts.

The installation is now automated once you complete the questionnaire. If you still want to do things manually, see the process below.

# Manual Installation

If you know what you're doing, jump to the [Quick Installation](#quick-installation).

## Template Pre-Deployment

We focus on using configuration- and template-based deployments when we can (and when it's appropriate). They introduce a basic level of trust in the environment by creating a standard to be followed, make it easy to handle multiple environments natrually, and support the minimal nature that we desire in our deployments.

`npx awayto unpack` somewhere so we have some files to work with.

Before we deploy our template, we need to setup any build resources we'll need. The template is going to deploy a number of services, including an API gateway, a lambda function and Cognito user/identity pools. Perhaps in the future that part will be automated, but for now we don't care where the database comes from. In this section, we'll use Amazon RDS to host our Postgres instance.

>`Alternative Use` If you don't want to use RDS, you can setup an EC2 instance, install postgres, configure it for external connections, and connect it to the same VPC and service group used by the lambda function.

Head over to [Amazon RDS](https://console.aws.amazon.com/rds/home) and create a new database, being sure to note the following:

- **Standard Create**

- **Engine Options**: PostgreSQL

- **Version**: 12.6

- **Templates**: Free Tier

- **Storage Type**: General Purpose

Name the database whatever you wish, provide a secure username and password (or let AWS auto generate a password for you), and take note of these. Down the page, we set the database to be publically accessible for the sake of local development. As well, you can create a new VPC if you would like, but the default works too.

The rest of the default settings should be fine, but you should read through all the options on the page to be familiar with what you're setting up. And in the future, if you go out of free tier, you could owe money depending on the setting you choose. This applies for any cloud service you end up using. Be conscious.

Once the database has been deployed, [connect to it](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ConnectToPostgreSQLInstance.html) and deploy the numbered SQL scripts in the `src/api/scripts` folder. 

With the database setup, we'll then go to the [Parameter Store](https://console.aws.amazon.com/systems-manager/parameters) and create the parameters we can use in our lambda. All of these string parameters should reference the names and values you used to setup the database (defaults are given here):

- PGDATABASE (postgres)

- PGHOST

- PGPASSWORD

- PGPORT (5432)

- PGUSER (postgres)

Next, we'll create an [IAM Role](https://console.aws.amazon.com/iam/home) that will get attached to our lambda function. Create a Role named `LambdaTrust` with the following AWS-Managed policies:

- AmazonS3FullAccess

- CloudWatchLogsFullAccess

- AmazonCognitoDeveloperAuthenticatedIdentities

- AmazonCognitoPowerUser

- AWSLambdaBasicExecutionRole

- AWSIoTFullAccess

- AWSConfigRulesExecutionRole

- AWSLambdaVPCAccessExecutionRole

>`Important!` The name `LambdaTrust` must be exact. It corresponds to a resource of the same name used in our template.yaml file.

When we deploy our lambda, we need to supply a zip file containing the code. This zip file is stored in an [S3 bucket](https://s3.console.aws.amazon.com/s3/home), so we need to create one. Remember there are [some rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) when naming S3 buckets. Something like `awayto-dev-lambda` works. Then we'll take `src/api/scripts/lambda.zip` and drop it in our newly created bucket. Using our example, we now have an object at the S3 URI: `s3://awayto-dev-lambda/lambda.zip`. The zip has an index.js file with a simple lambda:

```js
exports.handler =  async function(event, context) {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2))
  return true;
}
```

While we're in S3, let's also create a bucket to host our webapp. For example, `s3://awayto-dev-webapp`. We'll set this up later.

## Template Deployment

We'll now look at the [template.yaml](https://github.com/keybittech/awayto/blob/main/src/api/scripts/template.yaml) file and make any necessasry changes before deployment. First let's understand what's in the file. At the top, we list the parameters we just defined in the parameter store. We'll use those to get our lambda to connect to the database.

>`Required!` Before deploying the template.yaml file, find and replace all instances of `#APP_NAME#` to whatever name you desire. As well, fill in the `CodeUri` property using the S3 URI we just created, `s3://awayto-dev-lambda/lambda.zip` (using the one you created).

`StandardRequestFormat` defines the request format that the AWS API Gateway will transform all requests into before forwarding them on to our lambda function. This uses a special customizable mapping which you can learn more about on the [request-response mapping docs](https://docs.aws.amazon.com/apigateway/latest/developerguide/request-response-data-mappings.html). This mapping is converted into the lambda _event_, which will become important when we start making APIs. If you find yourself parsing the event object, and wonder about its origins, here is where you will find it.

Continuing, we have a resource of type [AWS::Serverless::Api](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-api.html). The `DefinitionBody` of this resource contains a [Swagger](https://swagger.io/) definition. So if you have a need to expand the API that gets deployed, you'll want to familiarize yourself with composing Swagger docs. There are, however, some custom [AWS Swagger specifications](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions.html) in the api, which help us define the following endpoints:

- `/public/{proxy+}` GET/POST - Here we define a public method that we'll handle differently in our lambda in order to securely deliver external content.

- `/{proxy+}` - Allows us to call any method (GET/PUT/POST/DELETE) with any path, removing the need to explicitly define them in AWS configuration.

The API definition also contains a snippet that informs the API Gateway to use our Cognito user pool as the authorizer for access to the secured portion of the API. The file concludes with the [AWS::Serverless::Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html) resource definition, our lambda function. Here we define the methods once again for use in local testing with [AWS SAM Local](https://github.com/aws/aws-sam-cli).

Once again, take some time to review these resources and their documentation; there are configurations which you may find beneficial. But don't worry too much, it's trivial to tear down and rebuild a stack in development, if you need to add a new configuration.

We have a database, we understand the resources we must deploy, and the template to deploy them. Time to deploy it. [CloudFormation](https://console.aws.amazon.com/cloudformation/home) is the perfect tool to generate AWS resources quickly and connect them to eachother. Go there and create a stack with new resources. We'll choose to `Upload a template file` and select our template. Then press `Next`.

**Stack Name**: This is the CloudFormation Stack name, not necessarily related to your application resources. If you're tagging resources by environment, here would be an appropriate place to include it. For example, `app-dev`.

**Environment**: This environment name is actually appended to some of the names of the resources we're about to create.

We'll leave be the rest of the parameters, as they are managed by the template itself, and used later in the deployment process. We can click `Next`.

There is no need to tag our stack, or add any advanced configurations. Our Administrator role will be used to execute the job. At this point, we've taken all the steps required to deploy our template. Press `Next` once more.

Finally, review the stack parameters and confirm the acknowledgements at the bottom of the page, which are simply informing us that we are about to create resources and roles in AWS, and to reflect on the impacts of such actions. Then `Create Stack`. Pretty simple, right? Now you get to enjoy excitedly clicking the deployment refresh button to see your page fill with green success messages and built resource names.

## Code Deployment

With our resources in place, let's go to each one and collect some important identifying information we'll use to hook things up in our app.

- AWS Region: This is chosen when you make your AWS account. `Ex: us-east-1`

- User Pool ID: Found on the Cognito [user pool](https://console.aws.amazon.com/cognito/users) details page. `Ex: us-east-1_ABcdefGhi`

- User Client ID: Found on the `App clients` sub-menu of the same page. `Ex: 1abcdef2ghijklmnopqrs34tuvw56`

- API Gateway ID: Found on the [API Gateway](https://console.aws.amazon.com/apigateway/main/apis) main page. `Ex: abcd1efg56`

- API Endpoint: Found by entering the details of your API, visiting the `Stages` submenu, and then clicking on the `stage named after the Environment name` you used when creating your stack. You want the Invoke URL at the top of this area. `Ex: https://abcd1efg56.execute-api.us-east-1.amazonaws.com/dev/`

Use these pieces of data to complete the Awayto installation:

```
npx awayto config
```

Once the application has been configured, we can start it up:

```
npm start
```

## Quick Installation

1. Install Awayto: `npm i -g @keybittech/awayto`

2. Unpack an Awayto instance in a new folder: `npx awayto unpack`

3. Create [Amazon RDS](https://console.aws.amazon.com/rds/home) instance: 
    - **Standard Create**

    - **Engine Options**: PostgreSQL
    - **Version**: 12.6
    - **Templates**: Free Tier
    - **Storage Type**: General Purpose

4. [Connect to it](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ConnectToPostgreSQLInstance.html) and deploy the scripts in `src/api/scripts`

5. Create the following string parameters in the [Parameter Store](https://console.aws.amazon.com/systems-manager/parameters):
    - PGDATABASE (postgres)

    - PGHOST
    - PGPASSWORD
    - PGPORT (5432)
    - PGUSER (postgres)

6. Create `LambdaTrust` [IAM Role](https://console.aws.amazon.com/iam/home) with following AWS-Managed policies:
    - AmazonS3FullAccess

    - CloudWatchLogsFullAccess
    - AmazonCognitoDeveloperAuthenticatedIdentities
    - AmazonCognitoPowerUser
    - AWSLambdaBasicExecutionRole
    - AWSIoTFullAccess
    - AWSConfigRulesExecutionRole
    - AWSLambdaVPCAccessExecutionRole

7. Create two S3 buckets and put `src/api/scripts/lambda.zip` in one:
    - `s3://<some-name>-lambda/lambda.zip`

    - `s3://<some-name>-webapp`

8. Rename `#APP_NAME#` to preferred name in `src/api/scripts/template.yaml`.

9. Update the `CodeUri` property in `template.yaml` with the value `s3://<some-name>-lambda/lambda.zip`.

10. In [CloudFormation](https://console.aws.amazon.com/cloudformation/home)
    
    - `Create Stack (with new resources)`

    - `Upload a template`
    
    - Select `template.yaml`
    
    - Click `Next`
    
    - Enter a `Stack name` and `Environment`
    
    - Click `Next` x 2
    
    - Acknowledge and `Create Stack`.

11. Note Resource IDs:

    - AWS Region: This is chosen when you make your AWS account. `Ex: us-east-1`

    - User Pool ID: Found on the Cognito [user pool](https://console.aws.amazon.com/cognito/users) details page. `Ex: us-east-1_ABcdefGhi`

    - User Client ID: Found on the `App clients` sub-menu of the same page. `Ex: 1abcdef2ghijklmnopqrs34tuvw56`

    - API Gateway ID: Found on the [API Gateway](https://console.aws.amazon.com/apigateway/main/apis) main page. `Ex: abcd1efg56`

    - API Endpoint: Found by entering the details of your API, visiting the `Stages` submenu, and then clicking on the `stage named after the Environment name` you used when creating your stack. You want the Invoke URL at the top of this area. `Ex: https://abcd1efg56.execute-api.us-east-1.amazonaws.com/dev/`

12. Configure the local Awayto installation: `npx awayto config`

13. `npm start`
