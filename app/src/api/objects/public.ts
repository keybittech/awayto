import { ApiModule, IRole } from 'awayto';

const tests: ApiModule = {

  get_public_api: {
    path: 'GET/public',
    cmnd: () => {
      try {
        return { name: 'kbt public api', version: 1 };
      } catch (error) {
        throw error;
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
            return (await props.client.query<IRole>(`SELECT * FROM roles`)).rows;
          default:
            break;
        }

        return false;
      } catch (error) {
        throw error;
      }
    }
  },

  post_public_api: {
    path: 'POST/public',
    cmnd: (props) => {
      try {
        return [];// { result: "you posted public", ...props.event.body };
      } catch (error) {
        throw error;
      }
    }
  },

  post_public_api_path: {
    path: 'POST/public/:path',
    cmnd: (props) => {
      const { path } = props.event.pathParameters;
      try {
        return true; //{ result: "you posted public path of " + path, ...props.event.body };
      } catch (error) {
        throw error;
      }
    }
  }

}

export default tests;