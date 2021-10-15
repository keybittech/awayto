import { ApiModule, IUuidNotes } from 'awayto';
import { buildUpdate } from '../util/db';

const uuidNotes: ApiModule = {

  create_uuid_notes : {
    path : 'POST/uuid_notes',
    cmnd : async (props) => {
      try {
        const { parentUuid: parent_uuid, note } = props.event.body as IUuidNotes;

        const response = await props.client.query<IUuidNotes>(`
          INSERT INTO uuid_notes (parent_uuid, note, created_on, created_sub)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [parent_uuid, note, new Date(), props.event.userSub]);
        
        return { id: response.rows[0].id };

      } catch (error) {
        throw error;
      }
    }
  },

  update_uuid_notes : {
    path : 'PUT/uuid_notes',
    cmnd : async (props) => {
      try {
        const { id, parentUuid: parent_uuid, note } = props.event.body as IUuidNotes;

        const updateProps = buildUpdate({ id, parent_uuid, note, updated_on: (new Date()).toString(), updated_sub: props.event.userSub });

        await props.client.query(`
          UPDATE uuid_notes
          SET ${updateProps.string}
          WHERE id = $1
        `, updateProps.array);

        return { id };
        
      } catch (error) {
        throw error;
      }

    }
  },

  get_uuid_notes : {
    path : 'GET/uuid_notes',
    cmnd : async (props) => {
      try {

        const response = await props.client.query<IUuidNotes>(`
          SELECT * FROM enabled_uuid_notes
        `);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  get_uuid_notes_by_id : {
    path : 'GET/uuid_notes/:id',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query<IUuidNotes>(`
          SELECT * FROM enabled_uuid_notes
          WHERE id = $1
        `, [id]);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  delete_uuid_notes : {
    path : 'DELETE/uuid_notes/:id',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query<IUuidNotes>(`
          DELETE FROM uuid_notes
          WHERE id = $1
        `, [id]);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  disable_uuid_notes : {
    path : 'PUT/uuid_notes/:id/disable',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        await props.client.query(`
          UPDATE uuid_notes
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

export default uuidNotes;