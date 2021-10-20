import { ask } from './tool.mjs';
import fs from 'fs';
import path from 'path';

const name = await ask('Name?');
const description = await ask('Description?');

const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));

const content = JSON.stringify({ name, description });


const file = fs.writeFileSync(path.resolve(__dirname, "./something.json"), content);

console.log('yep cool');
process.exit();


// console.log(name);
// console.log(description);
// process.send(name);


// process.exit