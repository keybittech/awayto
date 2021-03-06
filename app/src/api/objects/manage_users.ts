import { UserType, AttributeType } from '@aws-sdk/client-cognito-identity-provider';
import { ApiModule, IUserProfile, SiteRoles } from 'awayto';
import { adminCreateUser, adminDisableUser, adminEnableUser, getUserInfo, parseGroupString, parseGroupArray, updateUserAttributesAdmin, listUsers, attachCognitoInfoToUser } from "../util/cognito";
import { asyncForEach } from "../util/db";
import usersApi from './users';

const manageUsers: ApiModule = {

  create_manage_users_sub: {
    path: 'POST/manage/users/sub',
    cmnd: async (props) => {

      let user = props.event.body as IUserProfile & { password: string };
      
      const { username, email, password, groups } = user;
      try {

        const awsUser = await adminCreateUser({ username, email, password, groupRoles: parseGroupArray(groups) }) as UserType;
        user.sub = awsUser.Attributes?.find(a => a.Name == 'sub')?.Value as string;

        return user as IUserProfile;
      } catch (error) {
        throw error;
      }
    }
  },

  create_manage_users: {
    path: 'POST/manage/users',
    cmnd: async (props) => {
      try {
        const { id } = await usersApi.create_user.cmnd(props) as IUserProfile;

        const { rows: [ user ] } = await props.client.query<IUserProfile>(`
          SELECT * FROM enabled_users_ext
          WHERE id = $1 
        `, [id]);

        await attachCognitoInfoToUser(user);

        return user;
      } catch (error) {
        throw error;
      }
    }
  },

  update_manage_users: {
    path: 'PUT/manage/users',
    cmnd: async (props) => {
      try {
        const { username, groups } = props.event.body as IUserProfile;

        const groupRoles = parseGroupArray(groups)

        if (groupRoles.length) {

          const attributes = [{
            Name: 'custom:admin',
            Value: groupRoles
          }];

          await updateUserAttributesAdmin(username, attributes);
        }
        
        await usersApi.update_user.cmnd(props);

        return props.event.body as IUserProfile;
      } catch (error) {
        throw error;
      }
    }
  },

  get_manage_user: {
    path: 'GET/manage/users',
    cmnd: async (props) => {
      try {
        const { Users } = await listUsers();
        
        const { rows: dbUsers } = await props.client.query<IUserProfile>('SELECT * FROM enabled_users_ext');

        const users = Users?.map(u => {
          return {
            ...dbUsers.find(du => du.username == u.Username) || {},
            username: u.Username,
            status: u.UserStatus,
            createdOn: u.UserCreateDate?.toISOString(),
            groups: parseGroupString(u.Attributes?.find(a => a.Name == 'custom:admin')?.Value as string),
            sub: u.Attributes?.find(a => a.Name == 'sub')?.Value as string,
            email: u.Attributes?.find(a => a.Name == 'email')?.Value as string,
            locked: !u.Enabled
          } as IUserProfile;
        }) || [];

        return users;

      } catch (error) {
        throw error;
      }

    }
  },

  get_manage_users_paged: {
    path: 'GET/manage/users/page/:page/:perPage',
    cmnd: async (props) => {
      const { page, perPage } = props.event.pathParameters;

      const minId = (parseInt(page) - 1) * parseInt(perPage);
      try {

        const response = await props.client.query(`
          SELECT * FROM enabled_users_ext
          WHERE row > $1
          LIMIT $2
        `, [minId, perPage]);

        return (response.rows || []) as IUserProfile[];

      } catch (error) {
        throw error;
      }

    }
  },

  get_manage_user_by_id: {
    path: 'GET/manage/users/id/:id',
    cmnd: async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query(`
          SELECT * FROM enabled_users_ext
          WHERE id = $1 
        `, [id]);

        const user = (response.rows[0] || {}) as IUserProfile;

        user.username && await attachCognitoInfoToUser(user);

        return user;

      } catch (error) {
        throw error;
      }

    }
  },

  get_manage_user_by_sub: {
    path: 'GET/manage/users/sub/:sub',
    cmnd: async (props) => {
      try {
        const { sub } = props.event.pathParameters;

        const response = await props.client.query(`
          SELECT * FROM enabled_users_ext
          WHERE sub = $1 
        `, [sub]);

        const user = (response.rows[0] || {}) as IUserProfile;

        user.username && await attachCognitoInfoToUser(user);

        return user;

      } catch (error) {
        throw error;
      }

    }
  },

  get_manage_user_info: {
    path: 'POST/manage/users/info',
    cmnd: async (props) => {
      try {
        const { users } = props.event.body as { users: IUserProfile[] };

        await asyncForEach(users, async (user: IUserProfile) => {
          const info = await getUserInfo(user.username);
          user = { ...user, info };
        });

        return users;

      } catch (error) {
        throw error;
      }

    }
  },

  lock_manage_users: {
    path: 'PUT/manage/users/lock',
    cmnd: async (props) => {
      const profiles = props.event.body as IUserProfile[];
      try {
        await asyncForEach<IUserProfile>(profiles, async (profile) => {

          console.log('profile', profile);
          const result = await props.client.query<IUserProfile>(`
            UPDATE users
            SET locked = true
            WHERE username = $1;
          `, [profile.username])
          await adminDisableUser(profile.username);
        });

        return profiles;
      } catch (error) {
        throw error;
      }
    }
  },

  unlock_manage_users: {
    path: 'PUT/manage/users/unlock',
    cmnd: async (props) => {
      try {
        const profiles = props.event.body as IUserProfile[];

        await asyncForEach(profiles, async (profile) => {
          await props.client.query<IUserProfile>(`
            UPDATE users
            SET locked = false
            WHERE username = $1;
          `, [profile.username])
          await adminEnableUser(profile.username);
        });

        return profiles;
      } catch (error) {
        throw error;
      }
    }
  },

  put_manage_users_attribute: {
    path: 'PUT/manage/users/attributes',
    cmnd: async (props) => {
      try {
        const { username, awsAttributes } = props.event.body as { username: string, awsAttributes: AttributeType[] };
        
        if (awsAttributes) 
          await updateUserAttributesAdmin(username, awsAttributes);
        
        return true;
      } catch (error) {
        throw error;
      }
    }
  },
}

export default manageUsers;