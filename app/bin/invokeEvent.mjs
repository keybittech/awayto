import fs from 'fs/promises';
import path from 'path';
import { ask, readLambdaPayload, makeLambdaPayload } from './tool.mjs';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import child_process from 'child_process';

const lamClient = new LambdaClient();

let runByPackage = false;

export async function InvokeEvent(props = {}) {
  let install = !!props.awaytoId;
  
  if (!install) {
    props.awaytoId = await ask('Awayto Id:\n> ');
  }
  
  if (!props.event) {
    console.log('You must provide an event name.');
    return;
  }

  const __dirname = path.dirname(await fs.realpath(new URL(import.meta.url)));
  const seedPath = path.join(__dirname, `./data/seeds/${props.awaytoId}.json`);
  const awaytoConfig = JSON.parse(await fs.readFile(seedPath));

  try {
    if (props.local) {
      child_process.execSync(`sam local invoke -t ./template.sam.yaml -n ./env.json -e ./src/api/scripts/events/${props.event}.json ${awaytoConfig.awaytoId}Resource`, { stdio: 'inherit'})
    } else {
  
      const eventPath = path.join(__dirname, '../src/api/scripts/events', `${props.event}.json`);
      const event = JSON.parse(await fs.readFile(eventPath, { encoding: 'utf-8' }));
  
      const response = await lamClient.send(new InvokeCommand({
        FunctionName: awaytoConfig.functionName,
        InvocationType: 'RequestResponse',
        Payload: makeLambdaPayload(event)
      }));

      const payloadJson = readLambdaPayload(response.Payload);

      console.log(payloadJson);
    }
    
  } catch (error) {
    console.log('Error creating event', error);
  }

  if (runByPackage)
    process.exit();
}

export default InvokeEvent;

if (process.argv[1].includes('invokeEvent')) {
  runByPackage = true;
  var props = {};

  var idOptIndex = process.argv.indexOf('--awayto-id');
  if (idOptIndex > -1) {
    props.awaytoId = process.argv[idOptIndex + 1];
  }

  var eventOptIndex = process.argv.indexOf('--event');
  if (eventOptIndex > -1) {
    props.event = process.argv[eventOptIndex + 1];
  }

  if (process.argv.indexOf('--local') > -1) {
    props.local = true;
  }

  InvokeEvent(props);
}