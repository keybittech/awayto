import { ApiModule, IGroup } from 'awayto';
import { asyncForEach, buildUpdate } from '../util/db';

const manageGroups: ApiModule = {

  create_manage_groups : {
    path : 'POST/manage/groups',
    cmnd : async (props) => {
      try {

        const { name, roles } = props.event.body as IGroup;

        const { rows: [ group ] } = await props.client.query<IGroup>(`
          INSERT INTO groups (name)
          VALUES ($1)
          RETURNING id, name
        `, [name]);

        await asyncForEach(roles, async role => {
          await props.client.query(`
            INSERT INTO uuid_roles (parent_uuid, role_id, created_on, created_sub)
            VALUES ($1, $2, $3, $4)
          `, [group.id, role.id, new Date(), props.event.userSub])
        });

        group.roles = roles;
        
        return group;

      } catch (error) {
        throw error;
      }
    }
  },

  update_manage_groups : {
    path : 'PUT/manage/groups',
    cmnd : async (props) => {
      try {
        const { id, name, roles } = props.event.body as IGroup;

        const updateProps = buildUpdate({ id, name });

        const { rows: [ group ] } = await props.client.query<IGroup>(`
          UPDATE groups
          SET ${updateProps.string}
          WHERE id = $1
          RETURNING id, name
        `, updateProps.array);

        await asyncForEach(roles, async role => {
          await props.client.query(`
            INSERT INTO uuid_roles (parent_uuid, role_id, created_on, created_sub)
            VALUES ($1, $2, $3, $4)
          `, [group.id, role.id, new Date(), props.event.userSub])
        });

        group.roles = roles;

        return group;
        
      } catch (error) {
        throw error;
      }

    }
  },

  get_manage_groups : {
    path : 'GET/manage/groups',
    cmnd : async (props) => {
      try {

        const response = await props.client.query<IGroup>(`
          SELECT * FROM enabled_groups_ext
        `);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  get_manage_groups_by_id : {
    path : 'GET/manage/groups/:id',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query<IGroup>(`
          SELECT * FROM enabled_groups_ext
          WHERE id = $1
        `, [id]);
        
        return response.rows[0];
        
      } catch (error) {
        throw error;
      }

    }
  },

  delete_manage_groups : {
    path : 'DELETE/manage/groups/:id',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query<IGroup>(`
          DELETE FROM groups
          WHERE id = $1
        `, [id]);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  disable_manage_groups : {
    path : 'GET/manage/groups/:id/disable',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        await props.client.query(`
          UPDATE groups
          SET enabled = false
          WHERE id = $1
        `, [id]);

        return { id };
        
      } catch (error) {
        throw error;
      }

    }
  },

  get_group_name_valid : {
    path : 'GET/manage/group/valid/:name',
    cmnd : async (props) => {
      try {
        const { name } = props.event.pathParameters;

        const { rows: [{ count }] } = await props.client.query<{count: number}>(`
          SELECT COUNT(*) as count
          FROM groups
          WHERE name = $1
        `, [name]);

        return { checkingName: false, isValid: count == 0 };
        
      } catch (error) {
        throw error;
      }

    }
  }

}

export default manageGroups;