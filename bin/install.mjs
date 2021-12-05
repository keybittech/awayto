import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import child_process from 'child_process';
import { asyncForEach, replaceText } from './tool.mjs';

export default async function (id) {

  const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));

  console.log('Copying files into current directory');

  const copyFiles = [
    'bin',
    'src',
    'public',
    'apipkg',
    '.env',
    '.babelrc',
    '.eslintignore',
    'api.webpack.js',
    'config-overrides.js',
    'package-lock.json',
    'package.json',
    'settings.application.env',
    'tsconfig.json',
    'tsconfig.paths.json'
  ];

  copyFiles.forEach(file => {
    fse.copySync(path.resolve(__dirname, `../app/${file}`), path.resolve(process.cwd(), file));
  });

  const tmplFiles = [
    '.gitignore',
    'public/index.html',
    'settings.local.env',
    'settings.development.env',
    'settings.production.env'
  ];

  tmplFiles.forEach(file => {
    fse.copySync(path.resolve(__dirname, `../app/${file}.template`), path.resolve(process.cwd(), file));
  });

  console.log('Beginning app deployment process\n');

  const varFiles = [
    'package.json',
    'package-lock.json'
  ];

  const seedPath = path.join(__dirname, `data/seeds/${id}.json`);
  const seed = JSON.parse(fs.readFileSync(seedPath));

  await asyncForEach(varFiles, async file => {
    await asyncForEach(Object.keys(seed), async cfg => {
      await replaceText(path.resolve(process.cwd(), file), cfg, seed[cfg]);
    });
  });

  try {
    console.log('Performing npm install.')
    child_process.execSync(`npm i`, { stdio: 'inherit' });
    child_process.execSync(`npm i --prefix ./apipkg`, { stdio: 'inherit' });
  } catch (error) {
    console.log('npm install failed')
  }

  try {
    child_process.execSync(`node bin/deploy.mjs "${path.normalize(seedPath)}"`, {stdio: 'inherit'});
    console.log('Installation complete!');
  } catch (error) {
    console.log('deploy failed', error)
  }

  process.exit();
}