import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Link } from 'react-router-dom';

export function FAQ({ classes }: IProps): JSX.Element {
  return <>
    <Card>
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h5" id="faq">FAQ</Typography>
            <Typography variant="body1">If you feel that this list doesn't answer your questions, please <Typography className={classes.link} color="secondary" component={Link} to={{ pathname: "https://discord.gg/KzpcTrn5DQ" }} target="_blank">join the discord</Typography> to suggest changes.</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">What gets installed?</Typography>
            <Typography variant="body1">You can review the <Typography className={classes.link} color="secondary" component={Link} to={{ pathname: "https://github.com/keybittech/awayto/blob/main/INSTALL.md" }} target="_blank">old installation guide</Typography> to get an idea of the more detailed changes the installation process applies to AWS. In general, after running the installer, the following resources will be deployed to AWS:</Typography>
            <List dense={true}>
              <ListItem className="bullet"><ListItemText primary="Cognito User Pool" disableTypography={true} /></ListItem>
              <ListItem className="bullet"><ListItemText primary="Cognito App Client" disableTypography={true} /></ListItem>
              <ListItem className="bullet"><ListItemText primary="RDS Postgres Instance (t3.micro)" disableTypography={true} /></ListItem>
              <ListItem className="bullet"><ListItemText primary="API Gateway stage containing authorized and unauthorized routes" disableTypography={true} /></ListItem>
              <ListItem className="bullet"><ListItemText primary="Lambda Function to receive gateway events" disableTypography={true} /></ListItem>
              <ListItem className="bullet"><ListItemText primary="Service worker 'LambdaTrust' role for lambda-service group access" disableTypography={true} /></ListItem>
              <ListItem className="bullet"><ListItemText primary="S3 buckets for hosting built web and API bundles" disableTypography={true} /></ListItem>
              <ListItem className="bullet"><ListItemText primary="CloudFormation distribution to serve the webapp from S3" disableTypography={true} /></ListItem>
              <ListItem className="bullet"><ListItemText primary="Local file system containing a generic Lambda node-based API, Typescript type suite, and React web app originally generated with create-react-app." disableTypography={true} /></ListItem>
            </List>
            <Typography variant="h6">What is a seed file?</Typography>
            <Typography component="div" variant="body1">Awayto intends to be a re-packagable system, so that your creations can be used in various contexts. The seed file collects all the details of your installation. Should you need the ID of a resource, or to know what's been deployed, you'll find it in the seed files found in <pre>bin/data/seeds</pre>.</Typography>

            <Typography variant="h6">Where are things located in the file system?</Typography>
            <Typography variant="body1">The project is divided into three main code bases:</Typography>

            <Typography component="div" variant="body1"><strong>API:</strong> <pre>src/api</pre></Typography>
            <Typography component="div" variant="body1">The API is a generic Node JS structure which implements a Lambda function. The <pre>index.ts</pre> file collects all the db objects, and generates a set of routes defined by the type system. When called, the events will process inputs and return outputs as described by their associated type. In this way, the standard convention is that all API routes should be directly tied to some type within the system.</Typography>

            <Typography component="div" variant="body1"><strong>Core:</strong> <pre>src/core</pre></Typography>
            <Typography variant="body1">The core is where all the abstractions of Awayto live. Here we store all the types and third-party framework implementations as much as they can be abstracted from either the API or webapp, respectively. I.e. the core should contain only that which could be of use to both the API and webapp, and not their dependent parts. Don't incur the API to build webapp resources by building the webapp in the core, for example.</Typography>

            <Typography component="div" variant="body1"><strong>Webapp:</strong> <pre>src/webapp</pre></Typography>
            <Typography component="div" variant="body1">The webapp is a React application originally generated with create-react-app. React components in Awayto are considered to be the parts that make up a "module", and should all be stored in a <pre>modules</pre> folder. As well, you will find a <pre><Typography className={classes.link} color="secondary" component={Link} to={{ pathname: "https://github.com/keybittech/awayto#hooks" }} target="_blank">hooks</Typography></pre> folder containing convenience methods and utilities.</Typography>

            <Typography variant="h6">How does the module system work?</Typography>
            <Typography component="div" variant="body1">The <pre>src/webapp/modules</pre> folder houses, by convention, self-contained packages that live on their own but can interact with other modules if needed. When developing, all the modules are dynamically loaded into memory and lazy loaded into the application. Modules should contain all your React components, Redux reducers, and Typescript types. Components are loaded in a failsafe manner, and so can interact with eachother when present, but will just render an empty div if a module is missing.</Typography>

            <Typography variant="h6">How to add new components?</Typography>
            <Typography component="div" variant="body1">React components should sit in the main level of a module folder. The name of the component file will be the corresponding name you would use to reference it when making use of the <pre><Typography className={classes.link} color="secondary" component={Link} to={{ pathname: "https://github.com/keybittech/awayto#usecomponents" }} target="_blank">useComponents</Typography></pre> hook.</Typography>

            <Typography variant="h6">How to add new types?</Typography>
            <Typography variant="body1">Types are used in multiple contexts to accomplish different functionalities in Awayto: basic type-based architecture, Redux structure, and API routes. A basic usage that covers all these cases would look something like this:</Typography>
            <Typography component="div" variant="caption"><Grid className="overflow"><pre>{`// src/core/types/common.ts

declare global {
  interface ISharedState {
    test: ITestState;
  }

  type ICommonModuleActions = ITestActions | ....;

  interface ISharedActionTypes {
    test: ITestActionTypes;
  }
}

export type ITest = {
  id: string;
  value: string;
}

export type ITestState = Partial<ITest>;

export enum ITestActionTypes {
  POST_TEST = "POST/test",
  PUT_TEST = "PUT/test",
  GET_TEST = "GET/test",
  GET_TEST_BY_ID = "GET/test/:id",
  DELETE_TEST = "DELETE/test/:id",
  DISABLE_TEST = "PUT/test/disable"
}

export type IPostTestAction = PayloadAction<ITestActionTypes.POST_UUID_NOTES, ITestState>;
export type IPutTestAction = PayloadAction<ITestActionTypes.PUT_UUID_NOTES, ITestState>;
export type IGetTestAction = PayloadAction<ITestActionTypes.GET_UUID_NOTES, ITestState>;
export type IGetTestByIdAction = PayloadAction<ITestActionTypes.GET_UUID_NOTES_BY_ID, ITestState>;
export type IDeleteTestAction = PayloadAction<ITestActionTypes.DELETE_UUID_NOTES, ITestState>;
export type IDisableTestAction = PayloadAction<ITestActionTypes.DISABLE_UUID_NOTES, ITestState[]>;

export type ITestActions = IPostTestAction
  | IPutTestAction
  | IGetTestAction
  | IGetTestByIdAction
  | IDeleteTestAction
  | IDisableTestAction;

// src/webapp/modules/common/reducers/test.ts

const initialTestState: ITestState = {};

const testReducer: Reducer<ITestState, ITestActions> = (state = initialTestState, action) => {
  switch (action.type) {
    case ITestActionTypes.POST_TEST:
    case ITestActionTypes.PUT_TEST:
    case ITestActionTypes.GET_TEST_DETAILS:
    case ITestActionTypes.GET_TEST_DETAILS_BY_SUB:
    case ITestActionTypes.GET_TEST_DETAILS_BY_ID:
    case ITestActionTypes.DISABLE_TEST:
      return { ...state, ...action.payload };
    default:
      return { ...state };
  }
};

// Extend the useApi hook's available actions in src/webapp/hooks/useApi.ts

let ApiActions = Object.assign(
  ITestActionTypes, // Add our Action Types
  IManageUsersActionTypes,
  IManageGroupsActionTypes,
  IManageRolesActionTypes,
  IUserProfileActionTypes
) as Record<string, string>;

`}</pre></Grid></Typography>
            <Typography variant="body1">With these structures in place, you would be able to now create API routes that link to those defined, as well as access the object through Redux.</Typography>
            
            <Typography variant="h6">How do I deploy my new database scripts?</Typography>
            <Typography component="div" variant="body1">Any new <pre>.sql</pre> files in the <pre>src/api/scripts</pre> folder can be deployed by running <pre>npm run db-update</pre> from the main directory.</Typography>


          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </>
}


// What is hot component reloading?
// How to create an API?
// How to create a Class?
// How to create a reducer?
// How to ..

export default FAQ;