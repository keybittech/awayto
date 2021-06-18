import { ApiModule, IRole } from 'awayto';

const tests: ApiModule = {

  get_public_api: {
    path: 'GET/public',
    cmnd: async () => {
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
            return await (await props.client.query<IRole>(`SELECT * FROM roles`)).rows;
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
    cmnd: async (props) => {
      try {
        return { result: "you posted public", ...props.event.body };
      } catch (error) {
        throw new Error(error);
      }
    }
  },

  post_public_api_path: {
    path: 'POST/public/:path',
    cmnd: async (props) => {
      const { path } = props.event.pathParameters;
      try {
        return { result: "you posted public path of " + path, ...props.event.body };
      } catch (error) {
        throw new Error(error);
      }
    }
  }

}

export default tests;