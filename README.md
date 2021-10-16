# Awayto

[Awayto.dev](https://awayto.dev/) - [Typedoc](https://awayto.dev/docs/index.html) - [KeyBit Tech](https://keybittech.com/) - [Discord](https://discord.gg/KzpcTrn5DQ) - [Twitch](https://twitch.tv/awayto) - [Twitter](https://twitter.com/awaytodev) - [Contact](mailto:joe@keybittech.com) 

`!` We're actively looking for contributors and AWS replacements for our cloudless implementation! If interested, [join the discord](https://discord.gg/KzpcTrn5DQ). Thanks!

Awayto is a curated development platform, producing great value with minimal investment. With all the ways there are to reach a solution, it's important to understand the landscape. The right path is a way to be discovered.

Deploy a fully-featured application in about 10 minutes that is primed for quick development. Run a business, impress a client with a quick demo, finish your poc with time to spare; all easily achievable with Awayto. Managing the infrastructure for web applications is often cumbersome and time consuming. Awayto can be thought of as a method for working with web applications, laying out each step should you care to change something, removing complexity.

There are a few tenets of Awayto:  

- Enhance the developer experience

- Provide opportunities for developers to learn

- Minimal focus on deployment, managed centrally

- Use conventions that compliment functionality

The Awayto platform adheres to these tenets in part by being scalable, lightweight, and informative in its formation. The goal is to be a central platform that uses a precise and opinionated toolset to unite web, mobile, and IoT technologies. Developers and businesses alike can enjoy the many tools offered by Awayto:

- Rapidly deployable environment using enterprise level technologies

- Full scale business application built with business owners in mind

- Robust user management system allowing for self signup, federated IdP, or admin generated memberships

- Baked in group and role authorization framework

- Fully-typed development environment using Typescript; use the same types on the full stack

- Database schema designed for auditing and reporting

Awayto is a stack comprised of:

[`typescript`](https://www.typescriptlang.org/), 
[`react`](https://reactjs.org/), 
[`react-app-rewired`](https://github.com/timarney/react-app-rewired), 
[`redux`](https://redux.js.org/), 
[`@aws-sdk/client-Cognito-identity-provider`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-Cognito-identity-provider/),
[`@aws-sdk/client-s3`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/), 
[`pg`](https://node-postgres.com/), 
AWS Lambda, 
AWS API Gateway, 
AWS Cognito, 
AWS EC2, 
AWS RDS

## CLI Usage

#### Prerequisites

Any versions mentioned are what was used at time of writing. Any AWS tasks are performed on an AWS account with the Administrator role.

- An AWS Account

- AWS CLI 2.0.42

- Node 16.3.0

- Postgres 11.9

- Python 3.7.9

#### Install

```
npm i -g @keybittech/awayto
```

Make sure your console session can perform AWS CLI commands with Administrator role access. After restarting your console you can make a new folder or go into an existing folder and deploy an Awayto app.

```
mkdir proj
cd proj
awayto
```

Then follow the prompts. Old installation guide moved to `INSTALL.md` as the installer is now automated.

#### Update

In the future, if you want get access to new or updated tooling offered by Awayto, you can update the `src/core` folder using `awayto` in an existing install directory.

>`Caution!` This will overwrite any changes to existing files in the `src/core` folder. If you want to continue receiving Awayto updates, make your changes and developments outside of the `src/core` folder. But if you want to take control and change everything, that's ok too! Just be aware of what the `update` command will do.

## Usage

Type reference can be found [here](https://awayto.dev/docs/modules.html). Notable functionalities are described below. We're always trying to think of and develop new tools for developers. If you have an idea for something you want to use or see in the platform, or need help with something,  [Discord](https://discord.gg/KzpcTrn5DQ).

### Hooks
There are a few hooks offered out of the box, core to the Awayto UI design experience.

#### useApi
The `useApi` hook provides type-bound api functionality. By passing in a [IActionTypes](https://awayto.dev/docs/modules.html#iactiontypes) (e.g. [IUtilActionTypes](https://awayto.dev/docs/enums/iutilactiontypes.html), [IManageUsersActionTypes](https://awayto.dev/docs/enums/imanageusersactiontypes.html), etc...) we can control the structure of the api request, and more easily handle it on the backend.

```ts
import { useApi, IManageUsersActions } from 'awayto';

const { GET_MANAGE_USERS, GET_MANAGE_USERS_BY_ID } = IManageUsersActions;

const api = useApi();

api(GET_MANAGE_USERS);
```

As long as we have setup our model, `GET_MANAGE_USERS` will inform the system of the API endpoint and shape of the request/response.

If the endpoint takes path parameters (like `GET/manage/user/id/:id`), or if the request requires a body, we can pass these as the third parameter. Pass a boolean as the second argument to show or hide a loading screen.

```ts
api(GET_MANAGE_USERS_BY_ID, false, { id });
```
 
### useCognitoUser
Use this hook to get access to Cognito functionality once the user has logged in, or to check if the user is logged in.

```ts
import { useCognitoUser } from 'awayto';

const cognitoUser = useCognitoUser();

cognitoUser.getSession();
```

### useComponents
`useComponents` takes advantage of [React.lazy](https://reactjs.org/docs/code-splitting.html#reactlazy) as well as the [Proxy API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). By combining these functionalities, we end up with a tool that makes it easy to work in an expanding and quickly changing code base.

As new files are added to the project while the developer is working, they will be automatically discovered and made lazily available through `useComponents`. The only need is to refresh the browser page once the component has been added to the render cycle. If the developer tries to destructure a component that does not exist in the group of lazy loaded components, `useComponents` will return an empty `div`. This is configurable.

```ts
import { useComponents } from 'awayto';

function ParentComponent(props: IProps): JSX.Element {

  const { SomeComponent } = useComponents();

  return <SomeComponent {...props} />;

}
```

### useDispatch
This will soon be overtaken by a `useAction` hook.

Typical dispatch.

```ts
import { useDispatch } from 'awayto';

const dispatch = useDispatch();

dispatch(act(...));
```

### useRedux
Typical typed redux store hook. Awayto exports `useState` for convenience.

```ts
import { useRedux, useState } from 'awayto';

const profile = useRedux(state => state.profile);
const modifications = useState<IUserProfile>({ ...profile });
```

### act
Act is used to call Redux actions. This will be converted to a hook.

```ts
import { act, IUtilActions } from 'awayto';

const { SET_SNACK } = IUtilActions;

const snack = {
 snackType: 'error',
 snackOn: 'Please log back in.'
};

act(SET_SNACK, snack);
```

## Contributing

We are happy to have people help with the project whether it be code, feedback, or other. Join our [Discord](https://discord.gg/KzpcTrn5DQ) to learn about the project, meet other members in the community, and get involved.

For code related improvements:

1. Create a form.
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request
 
## License
 
The MIT License (MIT)

Copyright (c) 2021 [KeyBit Tech LLC](https://keybittech.com)
Contact Joe McCormick [joe@keybittech.com](mailto:joe@keybittech.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
