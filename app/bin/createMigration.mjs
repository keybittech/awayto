import fs from 'fs/promises';
import path from 'path';

export async function CreateMigration(props = {}) {
  
  if (!props.migration) {
    console.log('You must provide a migration name.');
    return;
  }

  try {
    const __dirname = path.dirname(await fs.realpath(new URL(import.meta.url)));
    const sqlFilePath = path.join(__dirname, '../src/api/scripts/db');
    
    const files = await fs.readdir(sqlFilePath);
    const id = files.filter(f => {
      const parts = f.split('.');
      return parts[parts.length-1] == 'sql'
    }).length + 1;
    const fileName = `${id}-${props.migration.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.sql`;

    await fs.writeFile(path.join(sqlFilePath, fileName), `-- ${fileName}`);
    
  } catch (error) {
    console.log('Error creating migration', error);
  }

  process.exit();
}

export default CreateMigration;

var props = {};
var migrationOptIndex = process.argv.indexOf('--migration');

if (migrationOptIndex > -1) {
  props.migration = process.argv[migrationOptIndex + 1];
}

CreateMigration(props);