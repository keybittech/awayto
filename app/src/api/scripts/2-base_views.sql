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
) as grps ON true



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
        WHERE eur."parentUuid" = u.id
    ) r
) as rls ON true
LEFT JOIN (
	SELECT eug."groupId", COUNT(eug."parentUuid") users
	FROM enabled_uuid_groups eug
    JOIN users u ON u.id = eug."parentUuid"
	GROUP BY eug."groupId"
) ug ON ug."groupId" = eg.id;