import { 
  AttributeType,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminDisableUserCommand, 
  AdminEnableUserCommand,
  AdminUpdateUserAttributesCommand,
  ListUsersCommand,
  ListUsersResponse, 
  UserType, 
  AdminCreateUserCommandInput,
  AdminGetUserCommandOutput
} from '@aws-sdk/client-cognito-identity-provider';

import { IGroup, IRole, IUserProfile, CognitoUserPool } from 'awayto';

const { CognitoClientId: ClientId, CognitoUserPoolId: UserPoolId } = process.env as { [prop: string]: string };

const pool = new CognitoUserPool({ ClientId, UserPoolId, Storage: {} as Storage });

export async function getUserInfo(Username: string): Promise<AdminGetUserCommandOutput> {
  const user = await pool.client.send(new AdminGetUserCommand({
    UserPoolId,
    Username
  }));
  return user;
}

export async function attachCognitoInfoToUser (user: IUserProfile): Promise<void> {
  const { UserStatus: status, UserAttributes, UserCreateDate } = await getUserInfo(user.username);

  const groupRoles = UserAttributes?.find(a => a.Name == 'custom:admin')?.Value as string;
  user.status = status as string;
  user.groups = parseGroupString(groupRoles);
  user.createdOn = UserCreateDate?.toISOString() || user.createdOn;
}

export function parseGroupString (value: string): IGroup[] {
  const groups = [] as IGroup[];
  value?.split(';').forEach(set => {
    const [name, roles] = set.split(':');
    groups.push({ name, roles: roles.split(',').map(r => ({ name: r })) as IRole[] } as IGroup)
  });
  return groups;
}

export function parseGroupArray (groups: IGroup[]): string {
  let groupRoles = '';
  groups.forEach((g, i) => {
    groupRoles += `${g.name}:${g.roles.map(r => r.name).join(',')}`;
    if (groups[i + 1] != null) groupRoles += ';';
  });
  return groupRoles;
}



export async function adminDisableUser(Username: string): Promise<boolean> {
  await pool.client.send(new AdminDisableUserCommand({
    UserPoolId,
    Username
  }));
  return true;
}

export async function adminEnableUser(Username: string): Promise<boolean> {
  await pool.client.send(new AdminEnableUserCommand({
    UserPoolId,
    Username
  }));
  return true;
}


export const listUsers = async (params: ListUsersResponse = {}): Promise<ListUsersResponse> => {
  
  let { Users = [] } = params;
  const { PaginationToken: token } = params;

  const listUserParams = { UserPoolId, ...(token ? { PaginationToken: token } : {}) };

  const { Users: users, PaginationToken } = await pool.client.send(new ListUsersCommand(listUserParams));

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


export async function updateUserAttributesAdmin (Username: string, UserAttributes: AttributeType[]): Promise<boolean> {
  await pool.client.send(new AdminUpdateUserAttributesCommand({
    UserPoolId,
    Username,
    UserAttributes
  }));
  return true;
}

export async function adminCreateUser ({ username = '', email = '', password = '', groupRoles = '' }): Promise<void | UserType> {
  const params: AdminCreateUserCommandInput = {
    UserPoolId,
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

  const { User } = await pool.client.send(new AdminCreateUserCommand(params));

  return User;

}