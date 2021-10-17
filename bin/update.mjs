import child_process from 'child_process';
import fse from 'fs-extra';

export default async function() {
  
  const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));

  const child = child_process.exec(`npm i -g @keybittech/awayto`);
  child.stdout.pipe(process.stdout);
  child.on('exit', function() {
    const copyFiles = [
      'src/core'
    ];

    copyFiles.forEach(async file => {
      fse.copySync(path.resolve(__dirname, `../app/${file}`), path.resolve(process.env.INIT_CWD, file));
    });

    process.exit();
  })

}