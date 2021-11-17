import fs from 'fs/promises';
import path from 'path';
import { asyncForEach, ask, makeLambdaPayload } from './tool.mjs';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lamClient = new LambdaClient();

const awaytoId = await ask("Awayto ID: \n>");
if (!awaytoId)
  process.exit();

const __dirname = path.dirname(await fs.realpath(new URL(import.meta.url)));
const sqlFilePath = path.join(__dirname, '../src/api/scripts');
const seedPath = path.join(__dirname, `./data/seeds/${awaytoId}.json`);

const files = await fs.readdir(sqlFilePath);
const awaytoConfig = JSON.parse(await fs.readFile(seedPath));

if (!awaytoConfig.scripts) awaytoConfig.scripts = {}

await asyncForEach(files, async f => {
  if (f.includes('sql') && !awaytoConfig.scripts[f]) {
    awaytoConfig.scripts[f] = await fs.readFile(path.join(sqlFilePath, f), { encoding: 'utf-8' });
    console.log('Calling DB script deployment API', f);
    await lamClient.send(new InvokeCommand({
      FunctionName: awaytoConfig.functionName,
      InvocationType: 'Event',
      Payload: makeLambdaPayload({
        "httpMethod": "POST",
        "resource": "/{proxy+}",
        "pathParameters": {
          "proxy": "deploy"
        },
        "body": {
          "script": awaytoConfig.scripts[f]
        }
      })
    }));
  }
})

await fs.writeFile(seedPath, JSON.stringify(awaytoConfig));

process.exit();