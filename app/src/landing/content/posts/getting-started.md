---
title: "Getting Started"
---

## Prerequisites
- AWS Administrator with AWS CLI (2.0.42)
- Python (3.7.9)
- Postgres (13.4)
- NodeJS (16.3.0)
- NPM (7.15.1)
- Docker (4.3; for SAM Local testing)

## Installation

Awayto installs as a global npm package because you will use it to deploy entire file structures for your application or API.

`npm i -g @keybittech/awayto`

With the CLI installed, you can go into any folder and install a new project with Awayto!

### install -- `awayto install <name> <environment> "<description>"`
This will install Awayto into the current directory. Awayto will generate some deployment files named appropriately for your resources. The installer will describe what is being installed and when. There will be an upcoming option to just install the filesystem or just deploy the AWS resources, but for now the entire stack gets deployed.

### uninstall -- `awayto uninstall <awaytoid>`
Remove all Awayto resources locally and deployed by id. You will need to provide an AwaytoID which you can find either in the `bin/data/seeds` folder or `settings.local.env` file in the main folder of an Awayto installation.

## Utility Commands
The `package.json` has a plethora of helpful commands that will do lots of the heavy lifing for you. Under the hood, we're using `react-app-rewired`, `webpack`, `sam local`, and utility scripts which can be found in the `bin` folder.

- `npm run start` -- Start a local dev server at `localhost:3000` which only serves the webapp, and uses the `settings.development.env` file.

- `npm run start-stack` -- Same as above, but if you opted for local-testing in the installation, this will start `sam local` using the `env.json` and `template.sam.yaml` files in the main directory. SAM Local starts up a docker contanerized instance of your Lambda function at `localhost:3001`. The webapp will pick up the `settings.local.env` file in this case.

- `npm run start-api` -- Starts just the api with the same above configuration. We use AWS SAM to run the local API, this requires Docker. AWS SAM, while extremely convenient, has gone through some growing pains; so if you ever run into issues, ask on the [discord](https://discord.gg/KzpcTrn5DQ). We use the `--warm-containers LAZY` option, so when your api starts make sure to make a couple requests to get the Lambda initialized.

- `npm run start-local` -- Starts just the webapp with the `settings.local.env` configuration.

- `npm run start-landing` -- Starts just the landing site using `hugo server`.

- `npm run watch-api` -- Start a webpack watcher on just the api.

- `npm run build-api` -- Build the api with webpack using `api.webpack.js`. As a result of the build, a minified index.js containing the Lambda handler will be placed into the `apipkg` folder.

- `npm run build-web` -- Build the webapp using react-app-rewired. As a result of this build, a `build` folder will be generated.

- `npm run build-landing` -- Build the landing site using Hugo. As a result of this build, a `landing_public` folder will be generated.

- `npm run build-deploy` -- Build both the api and webapp, in the event you are preparing to deploy a full stack update.

- `npm run install-stack` -- In the event you are installing a re-packaged version of Awayto, you can use this command to install the related AWS resources into your own AWS account.

- `npm run db-create-migration <name>` -- Autogenerate a migration in the `src/api/scripts/db` folder.

- `npm run db-update` -- Deploy any un-deployed `.sql` files in the `src/api/scripts` folder. You can see what's been deployed by reviewing the seed file `bin/data/seeds`.

- `npm run db-update-file <name>` -- If a script fails while updating, you can fix it then specifically-redeploy it with this command.

- `npm run invoke-event <name>` -- Use an event from `src/api/scripts/events` and run it against the live deployed lambda for your Awayto install.

- `npm run invoke-event-local <name>` -- Run Lambda events locally using AWS SAM.

- `npm run release` -- Run a release script which will deploy both the api (`apipkg` folder) and webapp (`build` folder) to s3. Then the script will request a CloudFront distribution invalidation on the entire webapp bucket. As well, the Lambda function will be re-deployed with the built handler.



## What now?
Awayto is a full stack environment. You can access your AWS account to review the resources that have been deployed, using the CloudFormation template as a guide `src/api/scripts/template.yaml`. The `src` folder contains two separate applications (`api`/`webapp`) as well as the `core` which stores Awayto's types and utilities.

Head over to the [FAQ](/posts/FAQ/) to learn more about what you can do with Awayto.