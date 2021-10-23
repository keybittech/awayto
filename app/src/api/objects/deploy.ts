import { ApiModule } from 'awayto';

const deploy: ApiModule = {

  get_deploy : {
    path : 'GET/deploy',
    cmnd : async (props) => {
      try {
        const tableCreation = await props.client.query(
          `
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE users (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              username VARCHAR ( 500 ),
              sub VARCHAR ( 50 ) NOT NULL,
              image VARCHAR ( 250 ),
              first_name VARCHAR ( 500 ),
              last_name VARCHAR ( 500 ),
              email VARCHAR ( 500 ),
              ip_address VARCHAR ( 20 ),
              locked BOOLEAN NOT NULL DEFAULT false,
              created_on TIMESTAMP NOT NULL DEFAULT NOW(),
              created_sub VARCHAR ( 50 ),
              updated_on TIMESTAMP,
              updated_sub VARCHAR ( 50 ),
              enabled BOOLEAN NOT NULL DEFAULT true
            );
            
            CREATE TABLE groups (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              name VARCHAR ( 50 ) NOT NULL,
              created_on TIMESTAMP NOT NULL DEFAULT NOW(),
              created_sub VARCHAR ( 50 ),
              updated_on TIMESTAMP,
              updated_sub VARCHAR ( 50 ),
              enabled BOOLEAN NOT NULL DEFAULT true
            );
            
            INSERT INTO
                groups (name)
            VALUES
                ('system'),
                ('group1'),
                ('group2');
            
            CREATE TABLE uuid_groups (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              parent_uuid uuid NOT NULL,
              group_id uuid NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
              created_on TIMESTAMP NOT NULL DEFAULT NOW(),
              created_sub VARCHAR ( 50 ),
              updated_on TIMESTAMP,
              updated_sub VARCHAR ( 50 ),
              enabled BOOLEAN NOT NULL DEFAULT true
            );
            
            CREATE TABLE roles (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              name VARCHAR ( 50 ) NOT NULL,
              created_on TIMESTAMP NOT NULL DEFAULT NOW(),
              created_sub VARCHAR ( 50 ),
              updated_on TIMESTAMP,
              updated_sub VARCHAR ( 50 ),
              enabled BOOLEAN NOT NULL DEFAULT true
            );
            
            INSERT INTO
                roles (name)
            VALUES
                ('admin'),
                ('manager'),
                ('user');
            
            CREATE TABLE uuid_roles (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              parent_uuid uuid NOT NULL,
              role_id uuid NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
              created_on TIMESTAMP NOT NULL DEFAULT NOW(),
              created_sub VARCHAR ( 50 ),
              updated_on TIMESTAMP,
              updated_sub VARCHAR ( 50 ),
              enabled BOOLEAN NOT NULL DEFAULT true
            );
            
            CREATE TABLE file_types (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              name VARCHAR ( 50 ) NOT NULL,
              created_on TIMESTAMP NOT NULL DEFAULT NOW(),
              created_sub VARCHAR ( 50 ),
              updated_on TIMESTAMP,
              updated_sub VARCHAR ( 50 ),
              enabled BOOLEAN NOT NULL DEFAULT true
            );
            
            INSERT INTO
              file_types (name)
            VALUES
              ('images'),
              ('documents');
            
            CREATE TABLE files (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              uuid VARCHAR ( 50 ) NOT NULL,
              name VARCHAR ( 50 ),
              file_type_id uuid NOT NULL REFERENCES file_types (id),
              location VARCHAR ( 250 ),
              created_on TIMESTAMP NOT NULL DEFAULT NOW(),
              created_sub VARCHAR ( 50 ),
              updated_on TIMESTAMP,
              updated_sub VARCHAR ( 50 ),
              enabled BOOLEAN NOT NULL DEFAULT true
            );
            
            CREATE TABLE uuid_files (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              parent_uuid VARCHAR ( 50 ) NOT NULL,
              file_id uuid NOT NULL REFERENCES files (id),
              created_on TIMESTAMP NOT NULL DEFAULT NOW(),
              created_sub VARCHAR ( 50 ),
              updated_on TIMESTAMP,
              updated_sub VARCHAR ( 50 ),
              enabled BOOLEAN NOT NULL DEFAULT true
            );
            
            CREATE TABLE uuid_notes (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              parent_uuid VARCHAR ( 50 ) NOT NULL,
              note VARCHAR ( 500 ),
              created_on TIMESTAMP NOT NULL DEFAULT NOW(),
              created_sub VARCHAR ( 50 ),
              updated_on TIMESTAMP,
              updated_sub VARCHAR ( 50 ),
              enabled BOOLEAN NOT NULL DEFAULT true
            );
            
            CREATE TABLE request_log (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              sub VARCHAR ( 50 ) NOT NULL,
              path VARCHAR ( 500 ),
              direction VARCHAR ( 10 ),
              code VARCHAR ( 5 ), 
              payload VARCHAR ( 5000 ),
              ip_address VARCHAR ( 50 ) NOT NULL,
              created_on TIMESTAMP NOT NULL DEFAULT NOW(),
              created_sub VARCHAR ( 50 ),
              updated_on TIMESTAMP,
              updated_sub VARCHAR ( 50 ),
              enabled BOOLEAN NOT NULL DEFAULT true
            );
            `
          );

        console.log('DEPLOYED TABLE CREATION', JSON.stringify(tableCreation, null, 2));

            
        const viewCreation = await props.client.query(
          `
            CREATE OR REPLACE VIEW
                enabled_users
            AS
            SELECT
                u.id,
                u.first_name as "firstName",
                u.last_name as "lastName",
                u.username,
                u.sub,
                u.image,
                u.email,
                u.locked,
                u.created_on as "createdOn",
                u.updated_on as "updatedOn",
                u.enabled,
                row_number() OVER () as row
            FROM users u
            WHERE u.enabled = true;

            CREATE OR REPLACE VIEW 
                enabled_groups 
            AS
            SELECT 
                id,
                name,
                row_number() OVER () as row
            FROM groups
            WHERE enabled = true;


            CREATE OR REPLACE VIEW 
                enabled_uuid_groups 
            AS
            SELECT 
                id,
                parent_uuid as "parentUuid",
                group_id as "groupId",
                row_number() OVER () as row
            FROM uuid_groups
            WHERE enabled = true;

            CREATE OR REPLACE VIEW 
                enabled_roles 
            AS
            SELECT 
                id,
                name,
                row_number() OVER () as row
            FROM roles
            WHERE enabled = true;

            CREATE OR REPLACE VIEW 
                enabled_uuid_roles 
            AS
            SELECT 
                id,
                parent_uuid as "parentUuid",
                role_id as "roleId",
                row_number() OVER () as row
            FROM uuid_roles
            WHERE enabled = true;

            CREATE OR REPLACE VIEW 
                enabled_file_types
            AS
            SELECT 
                id,
                name,
                row_number() OVER () as row
            FROM file_types
            WHERE enabled = true;

            CREATE OR REPLACE VIEW
                enabled_files 
            AS
            SELECT
                f.id,
                f.uuid,
                f.name,
                f.file_type_id as "fileTypeId",
                ft.name as "fileTypeName",
                f.location,
                row_number() OVER () as row
            FROM files f 
            JOIN file_types ft ON f.file_type_id = ft.id
            WHERE f.enabled = true;

            CREATE OR REPLACE VIEW
                enabled_uuid_files
            AS
            SELECT
                uf.id,
                uf.parent_uuid as "parentUuid",
                uf.file_id as "fileId",
                row_number() OVER () as row
            FROM uuid_files uf
            WHERE uf.enabled = true;

            CREATE OR REPLACE VIEW
                enabled_uuid_notes
            AS
            SELECT
                un.id,
                un.parent_uuid as "parentUuid",
                un.note,
                un.created_sub as "createdSub",
                row_number() OVER () as row
            FROM uuid_notes un
            WHERE un.enabled = true;

            CREATE OR REPLACE VIEW 
                enabled_groups_ext 
            AS
            SELECT 
                eg.*,
                ug.users,
                rls.* as roles
            FROM enabled_groups eg
            LEFT JOIN LATERAL (
                SELECT JSON_AGG(r.*) as roles
                FROM (
                    SELECT er.id, er.name
                    FROM enabled_uuid_roles eur
                    JOIN enabled_roles er ON eur."roleId" = er.id
                    WHERE eur."parentUuid" = eg.id
                ) r
            ) as rls ON true
            LEFT JOIN (
              SELECT eug."groupId", COUNT(eug."parentUuid") users
              FROM enabled_uuid_groups eug
                JOIN users u ON u.id = eug."parentUuid"
              GROUP BY eug."groupId"
            ) ug ON ug."groupId" = eg.id;

            CREATE OR REPLACE VIEW
                enabled_users_ext
            AS
            SELECT
                u.*,
                grps.*
            FROM enabled_users u
            LEFT JOIN LATERAL (
                SELECT JSON_AGG(g.*) as groups
                FROM (
                    SELECT ege.*
                    FROM enabled_uuid_groups eug
                    JOIN enabled_groups_ext ege ON eug."groupId" = ege.id
                    WHERE eug."parentUuid" = u.id
                ) g
            ) as grps ON true;
          `
        );

        console.log('DEPLOYED VIEW CREATION', JSON.stringify(viewCreation, null, 2));
        
        return true;

      } catch (error) {
        throw error;
      }
    }
  }

}

export default deploy;