---
title: "FAQ"
---

If you feel that this list doesn't answer your questions, please join the [discord](https://discord.gg/KzpcTrn5DQ) to suggest changes.

## What gets installed?
You can review the [old installation guide](https://github.com/keybittech/awayto/blob/main/INSTALL.md) to get an idea of the more detailed changes the installation process applies to AWS. In general, after running the installer, the following resources will be deployed to AWS:

- Cognito User Pool
- Cognito App Client
- RDS Postgres Instance (t3.micro)
- API Gateway stage containing authorized and unauthorized routes
- Lambda Function to receive gateway events
- Service worker 'LambdaTrust' role for lambda-service group access
- S3 buckets for hosting built web and API bundles
- CloudFormation distribution to serve the webapp from S3
- Local file system containing a generic Lambda node-based API, Typescript type suite, and React web app originally generated with create-react-app.

## What is the seed file?
Awayto intends to be a re-packagable system, so that your creations can be used in various contexts. The seed file collects all the details of your installation. Should you need the ID of a resource, or to know what's been deployed, you'll find it in the seed files found in `bin/data/seeds`.

## Where are things located in the file system?
The project is divided into three main code bases:

### API: `src/api`
The API is a generic Node JS structure which implements a Lambda function. The `index.ts` file collects all the db objects, and generates a set of routes defined by the type system. When called, the events will process inputs and return outputs as described by their associated type. In this way, the standard convention is that all API routes should be directly tied to some type within the system.

### Core: `src/core`
The core is where all the abstractions of Awayto live. Here we store all the types and third-party framework implementations as much as they can be abstracted from either the API or webapp, respectively. I.e. the core should contain only that which could be of use to both the API and webapp, and not their dependent parts. Don't incur the API to build webapp resources by building the webapp in the core, for example.

### Webapp: `src/webapp`
The webapp is a React application originally generated with create-react-app. React components in Awayto are considered to be the parts that make up a "module", and should all be stored in a `modules` folder. As well, you will find a [hooks](https://github.com/keybittech/awayto#hooks) folder containing convenience methods and utilities.

### Landing: `src/landing`
The Hugo framework is used to create a basic, static landing/marketing site. The intention is to create a resource based separation of concerns so in the future our webapp can be treated separately from any marketing or informational site.

## How does the module system work?
The `src/webapp/modules` folder houses, by convention, self-contained packages that live on their own but can interact with other modules if needed. When developing, all the modules are dynamically loaded into memory and lazy loaded into the application. Modules should contain all your React components, Redux reducers, and Typescript types. Components are loaded in a failsafe manner, and so can interact with eachother when present, but will just render an empty div if a module is missing.

## How to add new components?
React components should sit in the main level of a module folder. The name of the component file will be the corresponding name you would use to reference it when making use of the [useComponents](https://github.com/keybittech/awayto#usecomponents) hook.

## How to add new types?
Types are used in multiple contexts to accomplish different functionalities in Awayto: basic type-based architecture, Redux structure, and API routes. A basic usage that covers all these cases would look something like this:

```ts
// src/core/types/common.ts

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
```

With these structures in place, you would be able to now create API routes that link to those defined, as well as access the object through Redux.

## How do I deploy my new database scripts?
Any new `.sql` files in the `src/api/scripts` folder can be deployed by running `npm run db-update` from the main directory.

