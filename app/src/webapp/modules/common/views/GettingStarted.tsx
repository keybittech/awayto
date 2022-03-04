import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Link } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

export function GettingStarted ({ classes }: IProps): JSX.Element {
  return <>
    <Card>
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h5" id="start">Getting Started</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Prerequisites</Typography>
            <Typography variant="body1">AWS Administrator with AWS CLI (2.0.42)</Typography>
            <Typography variant="body1">Python (3.7.9)</Typography>
            <Typography variant="body1">Postgres (13.4)</Typography>
            <Typography variant="body1">NodeJS (16.3.0)</Typography>
            <Typography variant="body1">NPM (7.15.1)</Typography>
            <Typography variant="body1">Docker (4.3; for SAM Local testing)</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Installation</Typography>
            <Typography variant="body1">Awayto installs as a global npm package because you will use it to deploy entire file structures for your application or API.</Typography>
            <Typography component="div" variant="subtitle1"><pre>{`npm i -g @keybittech/awayto`}</pre></Typography>
            <Typography component="div" variant="body1">Once installed, you can go into any folder and type <pre>{`awayto`}</pre> to bring up the CLI. Here you have 3 options:</Typography>
            <Typography variant="subtitle1">0. install</Typography><Typography variant="body1">This will install Awayto into the current directory (~10 minutes). Answer a few questions and Awayto will generate some deployment files named appropriately for your resources. The installer will describe what is being installed and when. There will be an upcoming option to just install the filesystem or just deploy the AWS resources, but for now the entire stack gets deployed.</Typography>
            <Typography component="div" variant="subtitle1">1. uninstall</Typography><Typography component="div" variant="body1">Remove all Awayto resources locally and deployed by id (~1 min). You will need to provide an AwaytoID which you can find either in the <pre>{`bin/data/seeds`}</pre> folder or <pre>{`settings.local.env`}</pre> file in the main folder of an Awayto installation.</Typography>
            <Typography variant="subtitle1">2. create account</Typography><Typography variant="body1">Create an admin account for a deployment. Used to create accounts for existing Awayto installations.</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Utility Commands</Typography>
            <Typography component="div" variant="body1">The <pre>package.json</pre> has a plethora of helpful commands that will do lots of the heavy lifing for you. Under the hood, we're using <pre>react-app-rewired</pre>, <pre>webpack</pre>, <pre>sam local</pre>, and utility scripts which can be found in the <pre>bin</pre> folder.</Typography>

            <List>
              <ListItem className="bullet"><pre>npm run start</pre> -- Start a local dev server at <pre>localhost:3000</pre> which only serves the webapp, and uses the <pre>settings.development.env</pre> file.</ListItem>

              <ListItem className="bullet"><pre>npm run start-stack</pre> -- Same as above, but if you opted for local-testing in the installation, this will start <pre>sam local</pre> using the <pre>env.json</pre> and <pre>template.sam.yaml</pre> files in the main directory. SAM Local starts up a docker contanerized instance of your Lambda function at <pre>localhost:3001</pre>. The webapp will pick up the <pre>settings.local.env</pre> file in this case.</ListItem>

              <ListItem className="bullet"><pre>npm run start-api</pre> -- Starts just the api with the same above configuration. We use AWS SAM to run the local API, this requires Docker. AWS SAM, while extremely convenient, has gone through some growing pains; so if you ever run into issues, ask on the <Typography className={classes.link} color="secondary" component={Link} to={{ pathname: "https://discord.gg/KzpcTrn5DQ" }} target="_blank">discord</Typography>. We use the `--warm-containers LAZY` option, so when your api starts make sure to make a couple requests to get the Lambda initialized.</ListItem>
              
              <ListItem className="bullet"><pre>npm run start-local</pre> -- Starts just the webapp with the <pre>settings.local.env</pre> configuration.</ListItem>
              
              <ListItem className="bullet"><pre>npm run watch-api</pre> -- Start a webpack watcher on just the api.</ListItem>
              
              <ListItem className="bullet"><pre>npm run build-api</pre> -- Build the api with webpack using <pre>api.webpack.js</pre>. As a result of the build, a minified index.js containing the Lambda handler will be placed into the <pre>apipkg</pre> folder.</ListItem>

              <ListItem className="bullet"><pre>npm run build-web</pre> -- Build the webapp using react-app-rewired. As a result of this build, a <pre>build</pre> folder will be generated.</ListItem>
              
              <ListItem className="bullet"><pre>npm run build-deploy</pre> -- Build both the api and webapp, in the event you are preparing to deploy a full stack update.</ListItem>
              
              <ListItem className="bullet"><pre>npm run install-stack</pre> -- In the event you are installing a re-packaged version of Awayto, you can use this command to install the related AWS resources into your own AWS account.</ListItem>
              
              <ListItem className="bullet"><pre>npm run db-create-migration {`<name>`} </pre> -- Autogenerate a migration in the <pre>src/api/scripts/db</pre> folder.</ListItem>
              
              <ListItem className="bullet"><pre>npm run db-update</pre> -- Deploy any un-deployed <pre>.sql</pre> files in the <pre>src/api/scripts</pre> folder. You can see what's been deployed by reviewing the seed file <pre>bin/data/seeds</pre>.</ListItem>
              
              <ListItem className="bullet"><pre>npm run db-update-file {`<name>`}</pre> -- If a script fails while updating, you can fix it then specifically-redeploy it with this command.</ListItem>

              <ListItem className="bullet"><pre>npm run invoke-event {`<name>`}</pre> -- Use an event from <pre>src/api/scripts/events</pre> and run it against the live deployed lambda for your Awayto install.</ListItem>

              <ListItem className="bullet"><pre>npm run invoke-event-local {`<name>`}</pre> -- Run Lambda events locally using AWS SAM.</ListItem>

              <ListItem className="bullet"><pre>npm run release</pre> -- Run a release script which will deploy both the api (<pre>apipkg</pre> folder) and webapp (<pre>build</pre> folder) to s3. Then the script will request a CloudFront distribution invalidation on the entire webapp bucket. As well, the Lambda function will be re-deployed with the built handler.</ListItem>
              
            </List>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">What now?</Typography>
            <Typography component="div" variant="body1">Awayto is a full stack environment. You can access your AWS account to review the resources that have been deployed, using the CloudFormation template as a guide <pre>{`src/api/scripts/template.yaml`}</pre>. The <pre>{`src`}</pre> folder contains two separate applications (<pre>{`api`}</pre>/<pre>{`webapp`}</pre>) as well as the <pre>{`core`}</pre> which stores Awayto's types and utilities.</Typography>
            <Typography variant="body1">Head over to the <Typography className={classes.link} color="secondary" component={Link} to="/faq">FAQ</Typography> to learn more about what you can do with Awayto.</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </>
}

export default GettingStarted;