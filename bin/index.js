#! /usr/bin/env node

import { Command } from 'commander';
const cli = new Command();

import Install from './install.js';
import Uninstall from './uninstall.js';
import path from 'path';
import fs from 'fs';

cli.description('Manage your Awayto resources');
cli.name('awayto');
cli.usage('<command>');

cli
  .command('install')
  .alias('i')
  .alias('in')
  .argument('<name>', 'The name of your project.')
  .argument('<environment>', 'The environment to affect.')
  .argument('<description>', 'A description of your project. Use single or double quotes.')
  .action((name, environment, description) => {
    const seed = (new Date).getTime();

    let config = {
      name, 
      description, 
      environment,
      seed,
      awaytoId: `${name.toLowerCase().substring(0, Math.min(20, name.length))}${environment.toLowerCase().substring(0, Math.min(20, environment.length))}${seed}`
    };

    try {
      fs.writeFileSync(path.join(path.dirname(fs.realpathSync(new URL(import.meta.url))), `data/seeds/${config.awaytoId}.json`), JSON.stringify(config));
      Install(config.awaytoId);
      return;
    } catch (error) {
      console.log('error with installation', error);
      return;
    }
  });

cli
  .command('uninstall')
  .alias('u')
  .alias('un')
  .argument('[awaytoId]', 'The Awayto ID for the installation.')
  .option('-do, --delete-oai', 'Delete the Awayto OAI for Cloudformation resources.')
  .option('-dr, --delete-role', 'Delete the LambdaTrust role used for resource integrations.')
  .action(Uninstall);
  
cli.parse(process.argv);
