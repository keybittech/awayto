#! /usr/bin/env node

import Test from './test.mjs';
import Install from './install.mjs';
import Uninstall from './uninstall.mjs';
import CreateAccount from './createAccount.mjs';
import { ask } from './tool.mjs';

const action = await ask(`Pick a task (0):
0. install - this will install Awayto into the current directory (~10 minutes)
1. uninstall - remove all Awayto resources locally and deployed by id (~1 min)
2. create account - create an admin account for a deployment
> `) || '0';

switch (action) {
  case 'test':
    Test();
    break;
  case '0':
    Install();
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
