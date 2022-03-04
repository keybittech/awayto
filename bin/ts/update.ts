import * as child_process from 'child_process';
import * as fse from 'fs-extra';
import * as path from 'path';

const { INIT_CWD } = process.env as { [prop: string]: string };

export default async function() {

  const child = child_process.execSync(`npm i -g @keybittech/awayto`, { stdio: 'inherit' });
  
  const copyFiles = [
    'src/core'
  ];

  copyFiles.forEach(async file => {
    fse.copySync(path.resolve(__dirname, `../app/${file}`), path.resolve(INIT_CWD, file));
  });

  process.exit();

}