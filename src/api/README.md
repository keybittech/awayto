Setup AWS:

BEFORE DEPLOY

Create "LambdaTrust" Role with following policies:
 - AmazonS3FullAccess
 - CloudWatchLogsFullAccess
 - AWSLambdaBasicExecutionRole
 - AWSIoTFullAccess
 - AWSConfigRulesExecutionRole
 - AWSLambdaVPCAccessExecutionRole

Create SSM parameters in Parameter Store
    "PGDATABASE" : "postgres",
    "PGPASSWORD" : "...",
    "PGHOST" : "...",
    "PGPORT" : 5432,
    "PGUSER" : "postgres"

Build this repository with npm run build
Take the built index.js and put it in lambda.zip overwriting existing i.e.  "kbt-stackdeploy" (name must be AWS unique)
Create a folder in S3 "<project name>-stackdeploy" and place lambda.zip inside
Temporarily change template.yaml CodeUri to s3://<project name>-stackdeploy/lambda.zip

Deploy template.yaml

AFTER DEPLOY

Add inline policies to cognito role:

AllowS3KBTFilesAccess

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ReadWriteDeleteYourObjects",
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::<S3 Folder Name>",
                "arn:aws:s3:::<S3 Folder Name>/*"
            ]
        }
    ]
}


Create S3 files folder, block all public access, add CORS configuration

[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "POST",
            "GET",
            "PUT",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]

Make sure Lambda is connected to VPC -- Don't use public subnet
If using EC2 to host PG, change PGHOST in Lambda to ec2 internal IP like ip-255-255-255-80.ec2.internal


To test local:

make an env json file with following info:

{
  "some name matching the lambda name in template.yaml": {
    "Environment": "",
    "PGDATABASE" : "",
    "PGPASSWORD" : "",
    "PGHOST" : "",
    "PGPORT" : ,
    "PGUSER" : ""
  }
}

sam local invoke -t ./template.yaml -n ./env.json -e ./events/GETtestEvent.json <name from previous step>

sam local start-api -t ./template.yaml -n ./env.json -p 3001 --host 192.168.1.68
sam local start-api -t ./template.yaml -n ./env.json -p 3001 --host localhost