# Awayto
 
Awayto is a workflow enhancing platform, producing great value with minimal investment. With all the ways there are to reach a solution, it's important to understand the landscape. The right path is a way to be discovered.

There are a few tenants of Awayto:  
- Enhance the developer experience
- Minimal focus on deployment, managed centrally
- Provide opportunities for developers to learn
- Use conventions that compliment functionality

The Awayto platform adheres to these tenants in part by being scalable, lightweight, and secure. The goal is to be a central platform that uses a precise and opinionated toolset to unite web, mobile, and IoT technologies. Developers and businesses alike can enjoy the many tools offered by Awayto:

- Rapidly deployable environment using enterprise level technologies
- Full scale business application built with business owners in mind
- Robust user management system allowing for self signup, federated IdP, or admin generated memberships
- Baked in group and role authorization framework
- A fully typed Typescript development environment
- Curated set of database scripts designed with auditing and reporting in mind

## Installation
 
Detailed instructions to come. Awayto is a stack comprised of:

[`typescript`](https://www.typescriptlang.org/), 
[`react`](https://reactjs.org/), 
[`react-app-rewired`](https://github.com/timarney/react-app-rewired), 
[`redux`](https://redux.js.org/), 
[`@aws-sdk/client-cognito-identity-provider`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/),
[`@aws-sdk/client-s3`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/), 
[`pg`](https://node-postgres.com/), 
AWS Lambda, 
AWS API Gateway, 
AWS Cognito, 
AWS EC2, 
AWS RDS

## Usage

Type reference can be found [here](https://awayto.dev/docs/modules.html). Notable functionalities are described below. We're always trying to think of and develop new tools for developers. If you have an idea, come tell us on our [Discord](https://discord.gg/KzpcTrn5DQ).

### Hooks
There are a few hooks offered out of the box, core to the Awayto UI design experience.

#### useApi
The `useApi` hook provides type-bound api functionality. By passing in a [IActionTypes](https://www.keybittech.com/awayto/docs/modules.html#iactiontypes) (e.g. [IUtilActionTypes](https://www.keybittech.com/awayto/docs/enums/iutilactiontypes.html), [IManageUsersActionTypes](https://www.keybittech.com/awayto/docs/enums/imanageusersactiontypes.html), etc...) we can control the structure of the api request, and more easily handle it on the backend.

```ts
import { useApi, IManageUsersActions } from 'awayto';

const { GET_MANAGE_USERS, GET_MANAGE_USERS_BY_ID } = IManageUsersActions;

const api = useApi();

api(GET_MANAGE_USERS);
```

As long as we have setup our model, `GET_MANAGE_USERS` will inform the system of the API endpoint and shape of the request/response.

If the endpoint takes path parameters, we can pass them in as options. Pass a boolean as the second argument to show or hide a loading screen.

```ts
api(GET_MANAGE_USERS_BY_ID, false, { id });
```
 
### useCognitoUser
Use this hook to get access to cognito functionality once the user has logged in, or to check if the user is logged in.

```ts
import { useCognitoUser } from 'awayto';

const cognitoUser = useCognitoUser();

cognitoUser.getSession();
```

### useComponents
`useComponents` takes advantage of [React.lazy](https://reactjs.org/docs/code-splitting.html#reactlazy) as well as the [Proxy API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). By combining these functionalities, we end up with a tool that seamlessly meshes with expanding and changing codebases.

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
Contact Joe McCormick [joe.c.mccormick@gmail.com](mailto:joe.c.mccormick@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
