import { ListUsersResponse } from '@aws-sdk/client-cognito-identity-provider';
import { ApiModule, IUserProfile } from 'awayto';
import { listUsers, parseGroupString } from '../util/cognito';

const tests: ApiModule = {

  test_return_400: {
    path: 'GET/test/event/400',
    cmnd: async () => {
      try {
        return false;
      } catch (error) {
        throw error;
      }
    }
  },

  test_return_401: {
    roles: 'you_dont_have_this_role',
    path: 'GET/test/event/401',
    cmnd: async () => {
      try {
        return true;
      } catch (error) {
        throw error;
      }
    }
  },

  test_tests: {
    path: 'POST/test',
    cmnd: async (props) => {
      try {

        const { file } = props.event.body as { file: File };

        return true;

      } catch (error) {
        throw error;
      }
    }
  },

  test_signup: {
    path: 'POST/test/signup',
    cmnd: async (props) => {
      try {
        
        console.log(props.event);

        return true;

      } catch (error) {
        throw error;
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


        return true;

      } catch (error) {
        throw error;
      }
    }
  },

}

export default tests;