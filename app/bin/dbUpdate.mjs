import fs from 'fs/promises';
import path from 'path';
import { asyncForEach, ask, makeLambdaPayload, readLambdaPayload } from './tool.mjs';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lamClient = new LambdaClient();

let runByPackage = false;

const dbUpdate = async function (props = {}) {

  try {
    const __dirname = path.dirname(await fs.realpath(new URL(import.meta.url)));
    const sqlFilePath = path.join(__dirname, '../src/api/scripts/db');
    const seedPath = path.join(__dirname, `./data/seeds/${props.awaytoId}.json`);
    
    const files = await fs.readdir(sqlFilePath);
    const awaytoConfig = JSON.parse(await fs.readFile(seedPath));
    
    if (!awaytoConfig.scripts) awaytoConfig.scripts = {}
    
    async function LoadScript(fileName) {
      console.log('Deploying script:', fileName);
      awaytoConfig.scripts[fileName] = await fs.readFile(path.join(sqlFilePath, fileName), { encoding: 'utf-8' });
      const response = await lamClient.send(new InvokeCommand({
        FunctionName: awaytoConfig.functionName,
        InvocationType: 'RequestResponse',
        Payload: makeLambdaPayload({
          "httpMethod": "POST",
          "resource": "/{proxy+}",
          "pathParameters": {
            "proxy": "deploy"
          },
          "script": awaytoConfig.scripts[fileName]
        })
      }));

      const payloadJson = JSON.parse(readLambdaPayload(response.Payload));
      if (payloadJson.body) {
        payloadJson.body = JSON.parse(payloadJson.body);
        const { error } = payloadJson.body;
        if (error) {
          console.log(`ERROR: ${fileName} - ${error}.\nYou can fix the error then re-run just this script with "npm run db-update-file ${fileName}"`);
        }
      }
    }

    if (props.file) {
      await LoadScript(props.file);
    } else {
      await asyncForEach(files, async fileName => {
        if (fileName.includes('sql') && !awaytoConfig.scripts[fileName]) {
          await LoadScript(fileName);
        }
      });
    }
    
    await fs.writeFile(seedPath, JSON.stringify(awaytoConfig));
  } catch (error) {
    console.log('Error deploying db scripts:', error);
  }
  
  if (runByPackage)
    process.exit();
};

export default dbUpdate;

if (process.argv[1].includes('dbUpdate')) {
  runByPackage = true;
  var props = {};

  var idOptIndex = process.argv.indexOf('--awayto-id');
  if (idOptIndex > -1) {
    props.awaytoId = process.argv[idOptIndex + 1];
  }

  var fileOptIndex = process.argv.indexOf('--file');
  if (fileOptIndex > -1) {
    props.file = process.argv[fileOptIndex + 1];
  }

  await dbUpdate(props);
  process.exit();
}