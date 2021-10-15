#! /usr/bin/env node

const fs = require('fs')
const fse = require('fs-extra');
const path = require('path');
const child_process = require('child_process');
var readline = require('readline');

const [, , ...args] = process.argv;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise((resolve, reject) => {
  rl.question(q, function (answer) {
    resolve(answer);
  });
})

const replaceText = (file, from, to) => new Promise((resolve, reject) => {

  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      return reject(err);
    }
    var result = data.replaceAll(`##${from}##`, to);

    fs.writeFile(file, result, 'utf8', function (err) {
      if (err) return reject(err);
      resolve();
    });
  });

})

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


if (args[0] == 'unpack') {
  (async function () {

    const copyFiles = [
      'src',
      'public',
      '.babelrc',
      '.eslintignore',
      '.eslintrc',
      'config-overrides.js',
      'package.json',
      'settings.application.env',
      'tsconfig.json',
      'tsconfig.paths.json'
    ];

    copyFiles.forEach(async file => {
      await fse.copySync(path.resolve(__dirname, `../app/${file}`), path.resolve(process.env.INIT_CWD, file));
    })
    
    const tmplFiles = [
      '.gitignore',
      'public/index.html',
      'settings.development.env',
      'settings.production.env'
    ];

    tmplFiles.forEach(async file => {
      await fse.copySync(path.resolve(__dirname, `../app/${file}.template`), path.resolve(process.env.INIT_CWD, file));
    })

    console.log('Performing npm install ...')

    const child = child_process.exec(`npm i --prefix ${process.env.INIT_CWD}`);
    child.stdout.pipe(process.stdout);
    child.on('exit', function() {
      process.exit()
    })
  })();
}

if (args[0] == 'config') {
  (async function () {

    await ask('Make sure you have completed the AWS deployment portion of the Awayto installation. If you have done so, press Enter.\n');

    const answers = {
      appName: await ask('Whats the name of your application? (e.g. "awayto-application". Spaces/non-dashes will be removed.)\n'),
      appDescription: await ask('Give a description for the app.\n'),
      awsRegion: await ask('Whats the AWS Region?\n'),
      userPoolId: await ask('Whats the Cognito User Pool ID?\n'),
      appClientId: await ask('Whats the Cognito App Client ID?\n'),
      apiGatewayUrl: await ask('Whats the API Gateway URL?\n')
    }

    rl.close();

    const varFiles = [
      'package.json',
      'public/index.html',
      'public/manifest.json',
      'settings.development.env',
      'settings.production.env'
    ];

    varFiles.forEach(file => {
      asyncForEach(Object.keys(answers), async answer => {
        await replaceText(path.resolve(process.env.INIT_CWD, file), answer, answers[answer]);
      })
    })

  })();
}

if (args[0] == 'update') {
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