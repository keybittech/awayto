import fs from 'fs/promises';
import path from 'path';
import { asyncForEach, ask, makeLambdaPayload } from './tool.mjs';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lamClient = new LambdaClient();

const dbUpdate = async function (props = {}) {
  let install = !!props.awaytoId;
  
  if (!install) {
    props.awaytoId = await ask('Awayto Id:\n> ');
  }

  try {
    const __dirname = path.dirname(await fs.realpath(new URL(import.meta.url)));
    const sqlFilePath = path.join(__dirname, '../src/api/scripts');
    const seedPath = path.join(__dirname, `./data/seeds/${props.awaytoId}.json`);
    
    const files = await fs.readdir(sqlFilePath);
    const awaytoConfig = JSON.parse(await fs.readFile(seedPath));
    
    if (!awaytoConfig.scripts) awaytoConfig.scripts = {}
    
    await asyncForEach(files, async f => {
      if (f.includes('sql') && !awaytoConfig.scripts[f]) {
        awaytoConfig.scripts[f] = await fs.readFile(path.join(sqlFilePath, f), { encoding: 'utf-8' });
        console.log('Deploying sql script:', f);
        await lamClient.send(new InvokeCommand({
          FunctionName: awaytoConfig.functionName,
          InvocationType: 'Event',
          Payload: makeLambdaPayload({
            "httpMethod": "POST",
            "resource": "/{proxy+}",
            "pathParameters": {
              "proxy": "deploy"
            },
            "script": awaytoConfig.scripts[f]
          })
        }));
      }
    });

    if (props.file) {
      awaytoConfig.scripts[props.file] = await fs.readFile(path.join(sqlFilePath, props.file), { encoding: 'utf-8' });
      await lamClient.send(new InvokeCommand({
        FunctionName: awaytoConfig.functionName,
        InvocationType: 'Event',
        Payload: makeLambdaPayload({
          "httpMethod": "POST",
          "resource": "/{proxy+}",
          "pathParameters": {
            "proxy": "deploy"
          },
          "script": awaytoConfig.scripts[props.file]
        })
      }));
    }
    
    await fs.writeFile(seedPath, JSON.stringify(awaytoConfig));
  } catch (error) {
    console.log('Error deploying db scripts:', error);
  }

  if (!install) process.exit();
  
};

export default dbUpdate;

if (process.argv[2] == "--local") {
  dbUpdate()
}

if (process.argv[2] == "--file") {
  dbUpdate({ file: process.argv[3] })
}