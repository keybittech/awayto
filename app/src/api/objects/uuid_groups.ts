import { ApiModule, IUuidGroups } from 'awayto';
import { buildUpdate } from '../util/db';

const uuidGroups: ApiModule = {

  create_uuid_groups : {
    path : 'POST/uuid_groups',
    cmnd : async (props) => {
      try {

        const { parentUuid, groupId } = props.event.body as IUuidGroups;

        const response = await props.client.query(`
          INSERT INTO uuid_groups (parent_uuid, group_id, created_on, created_sub)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [parentUuid, groupId, new Date(), props.event.userSub]);
        
        return { id: response.rows[0].id };

      } catch (error) {
        throw new Error(error);
      }
    }
  },

  update_uuid_groups : {
    path : 'PUT/uuid_groups',
    cmnd : async (props) => {
      try {
        const { id, parentUuid: parent_uuid, groupId: group_id } = props.event.body as IUuidGroups;

        if (!id) throw 'Must have an ID to update uuid_groups';

        const updateProps = buildUpdate({ id, parent_uuid, group_id, updated_on: (new Date()).toString(), updated_sub: props.event.userSub as string });

        await props.client.query(`
          UPDATE uuid_groups
          SET ${updateProps.string}
          WHERE id = $1
        `, updateProps.array);

        return { id };
        
      } catch (error) {
        throw new Error(error);
      }

    }
  },

  get_uuid_groups : {
    path : 'GET/uuid_groups',
    cmnd : async (props) => {
      try {

        const response = await props.client.query(`
          SELECT * FROM enabled_uuid_groups
        `);
        
        return response.rows;
        
      } catch (error) {
        throw new Error(error);
      }

    }
  },

  get_uuid_groups_by_id : {
    path : 'GET/uuid_groups/:id',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query(`
          SELECT * FROM enabled_uuid_groups
          WHERE id = $1
        `, [id]);
        
        return response.rows;
        
      } catch (error) {
        throw new Error(error);
      }

    }
  },

  get_uuid_groups_by_parent_uuid : {
    path : 'GET/uuid_groups/parent/:parentUuid',
    cmnd : async (props) => {
      try {
        const { parentUuid } = props.event.pathParameters;

        const response = await props.client.query(`
          SELECT * FROM enabled_uuid_groups
          WHERE "parentUuid" = $1
        `, [parentUuid]);
        
        return response.rows;
        
      } catch (error) {
        throw new Error(error);
      }

    }
  },

  get_uuid_groups_by_group_id : {
    path : 'GET/uuid_groups/group/:groupId',
    cmnd : async (props) => {
      try {
        const { groupId } = props.event.pathParameters;

        const response = await props.client.query(`
          SELECT * FROM enabled_uuid_groups
          WHERE "groupId" = $1
        `, [groupId]);
        
        return response.rows;
        
      } catch (error) {
        throw new Error(error);
      }

    }
  },

  delete_uuid_groups : {
    path : 'DELETE/uuid_groups/:id',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;
        
        const response = await props.client.query(`
          DELETE FROM uuid_groups
          WHERE id = $1
        `, [id]);
        
        return response.rows;
        
      } catch (error) {
        throw new Error(error);
      }

    }
  }

}

export default uuidGroups;