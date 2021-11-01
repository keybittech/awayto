import uuid4 from 'uuid/v4';

import { buildUpdate } from '../util/db';

import { ApiModule, IFile } from 'awayto';

const files: ApiModule = {

  create_files : {
    path : 'POST/files',
    cmnd : async (props) => {
      try {
        const uuid = uuid4();
        const { name, fileTypeId: file_type_id, location } = props.event.body as IFile;

        const response = await props.client.query<{ id: string }>(`
          INSERT INTO files (uuid, name, file_type_id, location, created_on, created_sub)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [uuid, name, file_type_id, location, new Date(), props.event.userSub]);
        
        return { id: response.rows[0].id, uuid };

      } catch (error) {
        throw error;
      }
    }
  },

  update_files : {
    path : 'PUT/files',
    cmnd : async (props) => {
      try {
        const { id, name, fileTypeId: file_type_id, location } = props.event.body as IFile;

        const updateProps = buildUpdate({ id, name, file_type_id, location, updated_on: (new Date()).toString(), updated_sub: props.event.userSub });

        await props.client.query(`
          UPDATE files
          SET ${updateProps.string}
          WHERE id = $1
        `, updateProps.array);

        return { id };
        
      } catch (error) {
        throw error;
      }

    }
  },

  get_files : {
    path : 'GET/files',
    cmnd : async (props) => {
      try {

        const response = await props.client.query<IFile>(`
          SELECT * FROM enabled_files
        `);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  get_files_by_id : {
    path : 'GET/files/:id',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query<IFile>(`
          SELECT * FROM enabled_files
          WHERE id = $1
        `, [id]);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  delete_files : {
    path : 'DELETE/files/:id',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        const response = await props.client.query<IFile>(`
          DELETE FROM files
          WHERE id = $1
        `, [id]);
        
        return response.rows;
        
      } catch (error) {
        throw error;
      }

    }
  },

  disable_files : {
    path : 'PUT/files/disable',
    cmnd : async (props) => {
      try {
        const { id } = props.event.pathParameters;

        await props.client.query(`
          UPDATE files
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

export default files;