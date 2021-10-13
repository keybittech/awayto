import { ListUsersResponse } from '@aws-sdk/client-cognito-identity-provider';
import { ApiModule, IUserProfile } from 'awayto';
import { listUsers, parseGroupString } from '../util/cognito';

const tests: ApiModule = {

  test_return_400: {
    path: 'GET/test/event/400',
    cmnd: () => {
      try {
        return false;
      } catch (error) {
        throw new Error(error);
      }
    }
  },

  test_return_401: {
    contentRoles: ['you_dont_have_this_role'],
    path: 'GET/test/event/401',
    cmnd: () => {
      try {
        return true;
      } catch (error) {
        throw new Error(error);
      }
    }
  },

  test_tests: {
    path: 'POST/test',
    cmnd: (props) => {
      try {

        const { file } = props.event.body as { file: File };

        return true;

      } catch (error) {
        throw new Error(error);
      }
    }
  },

  test_signup: {
    path: 'POST/test/signup',
    cmnd: (props) => {
      try {
        
        console.log(props.event);

        return true;

      } catch (error) {
        throw new Error(error);
      }
    }
  },

  test_list_users: {
    path: 'GET/test/list/users',
    cmnd: async () => {
      try {

        const listUsersResponse = await listUsers();

        const mappedResposnse = listUsersResponse.Users?.map(u => {
          const user = {
            username: u.Username,
            status: u.UserStatus,
            groups: parseGroupString(u.Attributes?.find(a => a.Name == 'custom:admin')?.Value || '')
          } as IUserProfile;
        })


        return { listUsersResponse };

      } catch (error) {
        throw new Error(error);
      }
    }
  },

}

export default tests;