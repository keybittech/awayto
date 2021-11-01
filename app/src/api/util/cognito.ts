import AWS from 'aws-sdk';
import { AttributeType, ListUsersResponse, UserType, AdminCreateUserRequest, AdminUpdateUserAttributesRequest } from '@aws-sdk/client-cognito-identity-provider';

import { IGroup, IRole, IUserProfile } from 'awayto';

const client = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' });

const UserPoolId = process.env.CognitoUserPoolId as string;

const pool = { UserPoolId };

export const getUserInfo = async (Username: string) => await client.adminGetUser({ Username, ...pool }).promise();

export const adminDisableUser = async (Username: string) =>
  await client.adminDisableUser({ Username, ...pool }).promise();

export const adminEnableUser = async (Username: string) =>
  await client.adminEnableUser({ Username, ...pool }).promise();

export const deleteEnableUser = async (Username: string) =>
  await client.adminEnableUser({ Username, ...pool }).promise();

// export const listUsers = async () =>
//   await client.listUsers({ ...pool }).promise();

export const listUsers = async (params: ListUsersResponse = {}): Promise<ListUsersResponse> => {
  
  let { Users = [] } = params;
  const { PaginationToken: token } = params;

  const listUserParams = { ...pool, ...(token ? { PaginationToken: token } : {}) };

  const { Users: users, PaginationToken } = await client.listUsers(listUserParams).promise();

  if (users?.length) {
    
    Users = [ ...Users, ...users ];

    if (token?.length) {

      const { Users: pageUsers } = await listUsers({ Users, PaginationToken });
      
      if (pageUsers) {
        Users = [  ...Users, ...pageUsers ];
      }
    }

  }

  return { Users };
}

export const updateUserAdmin = async (Username: string) =>
  await client.adminUpdateUserAttributes({
    UserAttributes: [
      {
        Name: 'custom:admin',
        Value: 'system:user,admin'
      }
    ],
    UserPoolId,
    Username
  }).promise();

export const updateUserAttributesAdmin = async (Username: string, UserAttributes: AttributeType[]): Promise<any> => {
  const params: AdminUpdateUserAttributesRequest = {
    UserPoolId,
    Username,
    UserAttributes
  };

  try {
    return client.adminUpdateUserAttributes(params as AWS.CognitoIdentityServiceProvider.AdminUpdateUserAttributesRequest).promise();
  } catch (error) {
    throw error;
  }
}
  

export const adminCreateUser = async ({ username = '', email = '', password = '', groupRoles = '' }): Promise<boolean | UserType> => {
  const params: AdminCreateUserRequest = {
    ...pool,
    Username: username,
    ForceAliasCreation: true,
    TemporaryPassword: password,
    UserAttributes: [
      {
        Name: 'custom:admin',
        Value: groupRoles
      }]
  };

  if (email) {
    params.DesiredDeliveryMediums = ['EMAIL'];
    params.UserAttributes = [
      ...params.UserAttributes || [],
      ...[
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'email_verified',
          Value: email ? 'True' : 'False'
        }
      ]
    ]
  }

  try {
    return client.adminCreateUser(params as AWS.CognitoIdentityServiceProvider.AdminCreateUserRequest).promise().then(response => {
      if (!response.User)
        return false;
      return response.User;
    }).catch(error => {
      return false;
    });
  } catch (error) {
    throw error;
  }
}

const sets = [
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0123456789',
  '!@#$%^&*'
];

const passwordGen = (): string => {
  const chars = 4;
  const pass: string[] = [];

  sets.forEach(set => {
    for (let i = 0, n = set.length; i < chars; i++) {
      const seed = Math.floor(Math.random() * n);
      pass.splice(seed + i * chars, 0, set.charAt(seed));
    }
  });

  return pass.join('');
}

export function parseGroupString(value: string) {
  const groups = [] as IGroup[];
  value?.split(';').forEach(set => {
    const [name, roles] = set.split(':');
    groups.push({ name, roles: roles.split(',').map(r => ({ name: r })) as IRole[] } as IGroup)
  });
  return groups;
}

export const parseGroupArray = (groups: IGroup[]): string => {
  let groupRoles = '';
  groups.forEach((g, i) => {
    groupRoles += `${g.name}:${g.roles.map(r => r.name).join(',')}`;
    if (groups[i + 1] != null) groupRoles += ';';
  });
  return groupRoles;
}

export const attachCognitoInfoToUser = async (user: IUserProfile) => {
  const { UserStatus: status, UserAttributes, UserCreateDate } = await getUserInfo(user.username);

  const groupRoles = UserAttributes?.find(a => a.Name == 'custom:admin')?.Value as string;
  user.status = status as string;
  user.groups = parseGroupString(groupRoles);
  user.createdOn = UserCreateDate?.toISOString() || user.createdOn;
}

// export const adminCreateUser = ({ email }: CognitoUserData): Promise<AdminCreateUserResponse | AWSError> => (
//   new Promise((resolve, reject) => {
//     const params = {
//       UserPoolId: userPoolId,
//       Username: email,
//       DesiredDeliveryMediums: ['EMAIL'],
//       ForceAliasCreation: true,
//       TemporaryPassword: generatePassword(),
//       UserAttributes: [
//         {
//           Name: 'email',
//           Value: email
//         },
//         {
//           Name: 'email_verified',
//           Value: 'True'
//         }
//       ]
//     };

//     cognitoIdentityServiceProvider.adminCreateUser(params, function (err, data) {
//       if (err) reject(err);
//       else resolve(data);
//     });

//   })
// );


/**
 * Register a user with Amazon Cognito
 *
 * @param {string} username - username of the user
 * @param {string} password - password of the user
 * @param {string} email - email of the user
 * @returns {Promise<string>} Promise object represents the username of the registered user
 */
// export const register = (data) => (
//   new Promise((resolve, reject) => {
//     getUserPool().signUp(data.username, password, null, null, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data.user.getUsername());
//       }
//     });
//   })
// );

// export const adminCreateUser = ({ email }: CognitoUserData): Promise<AdminCreateUserResponse | AWSError> => (
//   new Promise((resolve, reject) => {
//     const params = {
//       UserPoolId: userPoolId,
//       Username: email,
//       DesiredDeliveryMediums: ['EMAIL'],
//       ForceAliasCreation: true,
//       TemporaryPassword: generatePassword(),
//       UserAttributes: [
//         {
//           Name: 'email',
//           Value: email
//         },
//         {
//           Name: 'email_verified',
//           Value: 'True'
//         }
//       ]
//     };

//     cognitoIdentityServiceProvider.adminCreateUser(params, function (err, data) {
//       if (err) reject(err);
//       else resolve(data);
//     });

//   })
// );

// export const getUserAdmin = async (Username: string): Promise<AdminUpdateUserAttributesResponse | AWSError> =>
//   await cognitoIdentityServiceProvider.adminGetUser({ Username, UserPoolId: userPoolId }).promise();

// export const updateUserAdmin = async (Username: string): Promise<AdminUpdateUserAttributesResponse | AWSError> =>
//   await cognitoIdentityServiceProvider.adminUpdateUserAttributes({
//     UserAttributes: [
//       {
//         Name: 'custom:user:admin',
//         Value: 'system'
//       }
//     ],
//     UserPoolId: userPoolId,
//     Username
//   }).promise();



// export const listUsers = (filter: string): Promise<ListUsersResponse | AWSError> => (
//   new Promise((resolve, reject) => {
//     const params = {
//       UserPoolId: userPoolId,
//       Filter: `email = "${filter}"`
//     };

//     cognitoIdentityServiceProvider.listUsers(params, (err, data) => {
//       if (err) reject(err);
//       else resolve(data);
//     });
//   })
// );

// export const disableUser = (Username: string): Promise<AdminDisableUserResponse | AWSError> => (
//   new Promise((resolve, reject) => {
//     const params = {
//       Username,
//       UserPoolId: userPoolId
//     };

//     cognitoIdentityServiceProvider.adminDisableUser(params, (err, data) => {
//       if (err) reject(err);
//       else resolve(data);
//     })
//   })
// )
// export const enableUser = (Username: string): Promise<AdminEnableUserResponse | AWSError> => (
//   new Promise((resolve, reject) => {
//     const params = {
//       Username,
//       UserPoolId: userPoolId
//     };

//     cognitoIdentityServiceProvider.adminEnableUser(params, (err, data) => {
//       if (err) reject(err);
//       else resolve(data);
//     })
//   })
// )

// export const deleteUser = (Username: string): Promise<Record<string, never> | AWSError> => (
//   new Promise((resolve, reject) => {
//     const params = {
//       Username,
//       UserPoolId: userPoolId
//     };

//     cognitoIdentityServiceProvider.adminDeleteUser(params, (err, data) => {
//       if (err) reject(err);
//       else resolve(data);
//     })
//   })
// )



