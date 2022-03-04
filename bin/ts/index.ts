#! /usr/bin/env node

import Install from './install';
import Uninstall from './uninstall';
import CreateAccount from './createAccount';
import { ask } from './tool';
import * as path from 'path';
import * as fs from 'fs';

const action = await ask(`Pick a task (0):
0. install - this will install Awayto into the current directory (~10 minutes)
1. uninstall - remove all Awayto resources locally and deployed by id (~1 min)
2. create account - create an admin account for a deployment
> `) || '0';

switch (action) {
  case '0':
    
    const config = {
      name: await ask('Project Name (\'awayto\'):\n> ', undefined, /^[a-zA-Z0-9]*$/) || 'awayto',
      environment: await ask('Environment (\'dev\'):\n> ') || 'dev',
      description: await ask('Project Description (\'Awayto is a workflow enhancing platform, producing great value with minimal investment.\'):\n> ') || 'Awayto is a workflow enhancing platform, producing great value with minimal investment.'
    } as { [prop: string]: string | number }
    
    // Generate uuids
    config.seed = (new Date).getTime();
    config.awaytoId = `${config.name}${config.environment}${config.seed}`;
    
    // const __dirname = path.dirname(fs.realpathSync(new URL(import.meta.url)));
    fs.writeFileSync(path.join(__dirname, `data/seeds/${config.awaytoId}.json`), JSON.stringify(config));

    Install(config.awaytoId);
    break;
  case '1':
    Uninstall();
    break;
  case '2':
    CreateAccount();
    break;
  default:
    break;
}
