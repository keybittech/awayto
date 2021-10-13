import { ApiModule, IRole } from 'awayto';

const tests: ApiModule = {

  get_public_api: {
    path: 'GET/public',
    cmnd: () => {
      try {
        return { name: 'kbt public api', version: 1 };
      } catch (error) {
        throw new Error(error);
      }
    }
  },

  get_public_api_path: {
    path: 'GET/public/:path',
    cmnd: async (props) => {
      try {
        
        const { path } = props.event.pathParameters;

        switch(path) {
          case 'roles':
            const roles = await props.client.query<IRole>(`SELECT * FROM roles`);
            return roles.rows;
          default:
            break;
        }

        return false;
      } catch (error) {
        throw new Error(error);
      }
    }
  },

  post_public_api: {
    path: 'POST/public',
    cmnd: () => {
      try {
        return { result: "you posted public" };
      } catch (error) {
        throw new Error(error);
      }
    }
  },

  post_public_api_path: {
    path: 'POST/public/:path',
    cmnd: (props) => {
      const { path } = props.event.pathParameters;
      try {
        return { result: "you posted public path of " + path };
      } catch (error) {
        throw new Error(error);
      }
    }
  }

}

export default tests;