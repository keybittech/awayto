import { TreeItem } from '@material-ui/lab';
import { ApiModule, IUserProfile } from 'awayto';
import { buildUpdate } from '../util/db';

const users: ApiModule = {

  get_username_availability: {
    path: 'GET/public/username',
    cmnd: (props) => {
      try {
        return true; // { result: "you are public", ...props.event.pathParameters, ...props.event.queryStringParameters };
      } catch (error) {
        throw error;
      }
    }
  },

  create_user: {
    path: 'POST/users',
    cmnd: async (props) => {
      try {

        const { firstName: first_name, lastName: last_name, username, email, image, sub } = props.event.body as IUserProfile;
            
        const { rows: [ user ] } = await props.client.query<IUserProfile>(`
          INSERT INTO users(sub, username, first_name, last_name, email, image, created_on, created_sub, ip_address)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, sub, username, first_name as "firstName", last_name as "lastName", email, image
        `, [sub || props.event.userSub, username, first_name, last_name, email, image, new Date(), props.event.userSub, props.event.sourceIp]);

        return user;

      } catch (error) {
        throw error;
      }
    }
  },

  update_user: {
    path: 'PUT/users',
    cmnd: async (props) => {
      try {
        const { id, firstName: first_name, lastName: last_name, email, image } = props.event.body as IUserProfile;

        const updateProps = buildUpdate({ id, first_name, last_name, email, image, updated_on: (new Date()).toISOString(), updated_sub: props.event.userSub });

        const { rows: [ user ] } = await props.client.query<IUserProfile>(`
          UPDATE users
          SET ${updateProps.string}
          WHERE id = $1
          RETURNING id, first_name as "firstName", last_name as "lastName", email, image
        `, updateProps.array);

        return user;

      } catch (error) {
        throw error;
      }
    }
  },

  get_user_profile: {
    path: 'GET/users/profile',
    cmnd: async (props) => {
      try {
        const response = await props.client.query<IUserProfile>(`
          SELECT * 
          FROM enabled_users
          WHERE sub = $1
        `, [props.event.userSub]);

        return response.rows[0] || {};

      } catch (error) {
        throw error;
      }

    }
  },

  get_user_by_sub: {
    path: 'GET/users/sub/:sub',
    cmnd: async (props) => {
      const { sub } = props.event.pathParameters;

      try {
        const response = await props.client.query<IUserProfile>(`
          SELECT * FROM enabled_users
          WHERE sub = $1 
        `, [sub]);

        return response.rows[0] || {};

      } catch (error) {
        throw error;
      }

    }
  },

  get_user_by_id: {
    path: 'GET/users/:id',
    cmnd: async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query<IUserProfile>(`
          SELECT * FROM enabled_users
          WHERE id = $1 
        `, [id]);

        return response.rows[0] || {};

      } catch (error) {
        throw error;
      }

    }
  },

  // post_user_push_notification_token: {
  //   path: 'POST/users/push_token',
  //   cmnd: async (props) => {
  //     try {

  //       const response = await props.client.query(`
  //         UPDATE users
  //         SET push_token = $2
  //         WHERE sub = $1
  //       `, [props.event.userSub, props.event.body.token]);

  //       return response.rows;

  //     } catch (error) {
  //       throw error;
  //     }

  //   }
  // },

  disable_users : {
    path : 'PUT/users/:id/disable',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        await props.client.query(`
          UPDATE users
          SET enabled = false
          WHERE id = $1
        `, [id]);

        return { id };
        
      } catch (error) {
        throw error;
      }

    }
  }

}

export default users;