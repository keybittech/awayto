import { ApiModule, IRole } from 'awayto';
import { buildUpdate } from '../util/db';

const manageRoles: ApiModule = {

  create_roles : {
    path : 'POST/manage/roles',
    cmnd : async (props) => {
      try {

        const { name } = props.event.body as IRole;

        const response = await props.client.query<IRole>(`
          INSERT INTO roles (name)
          VALUES ($1)
          RETURNING id, name
        `, [name]);
        
        return response.rows[0];

      } catch (error) {
        throw error;
      }
    }
  },

  update_roles : {
    path : 'PUT/manage/roles',
    cmnd : async (props) => {
      try {
        const { id, name } = props.event.body as IRole;

        const updateProps = buildUpdate({ id, name });

        const response = await props.client.query<IRole>(`
          UPDATE roles
          SET ${updateProps.string}
          WHERE id = $1
          RETURNING id, name
        `, updateProps.array);

        return response.rows[0];
        
      } catch (error) {
        throw error;
      }

    }
  },

  get_roles : {
    path : 'GET/manage/roles',
    roles: 'system:goofball',
    inclusive: true,
    cmnd : async (props) => {
      try {

        const response = await props.client.query<IRole>(`
          SELECT * FROM enabled_roles
        `);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  get_roles_by_id : {
    path : 'GET/manage/roles/:id',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query<IRole>(`
          SELECT * FROM enabled_roles
          WHERE id = $1
        `, [id]);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  delete_roles : {
    path : 'DELETE/manage/roles/:id',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query<IRole>(`
          DELETE FROM roles
          WHERE id = $1
        `, [id]);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  disable_roles : {
    path : 'PUT/manage/roles/:id/disable',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        await props.client.query(`
          UPDATE roles
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

export default manageRoles;