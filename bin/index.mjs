#! /usr/bin/env node

import Test from './test.mjs';
import Install from './install.mjs';
import Uninstall from './uninstall.mjs';
import { ask } from './tool.mjs';

const action = await ask('Pick a task (0):\n0. install - this will install Awayto into the current directory (~10 minutes)\n1. uninstall - remove all Awayto resources locally and deployed by id (~1 min)\n> ') || '0';

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
  default:
    break;
}
