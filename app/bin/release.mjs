import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import child_process from 'child_process';
import crypto from 'crypto';
import archiver from 'archiver';

import { ask } from './tool.mjs';

const release = async function (props = {}) {
  let install = !!Object.keys(props).length;
  
  if (!install) {
    props = {
      awaytoId: await ask('Awayto Id:\n >')
    }
  }

  try {
    const __dirname = path.dirname(await fs.realpath(new URL(import.meta.url)));
    const seedPath = path.join(__dirname, `./data/seeds/${props.awaytoId}.json`);
    
    const awaytoConfig = JSON.parse(await fs.readFile(seedPath));
    
    const apiSha = crypto.createHash('sha1').update(Buffer.from(await fs.readFile(path.join(__dirname, '../apipkg/index.js')))).digest('base64');
    
    if (apiSha != awaytoConfig.apiSha) {
      awaytoConfig.apiSha = apiSha;
      
      console.log('Deploying updated API.');
      
      const output = createWriteStream('lambda.zip');
      const archive = archiver('zip');
      
      archive.on('error', function (error) {
        throw error;
      });
      
      archive.pipe(output);
      archive.directory('apipkg/', false);
      
      output.on('close', async function () {
        child_process.execSync(`aws s3 cp ./lambda.zip s3://${awaytoConfig.awaytoId}-lambda`, { stdio: 'inherit' });
        child_process.execSync(`aws lambda update-function-code --function-name ${awaytoConfig.environment}-${awaytoConfig.awsRegion}-${awaytoConfig.awaytoId}Resource --region ${awaytoConfig.awsRegion} --s3-bucket ${awaytoConfig.awaytoId}-lambda --s3-key lambda.zip`, { stdio: 'inherit' });
        child_process.execSync(`rm lambda.zip`, { stdio: 'inherit' });
      });
      
      await archive.finalize();
    }

    const webSha = crypto.createHash('sha1').update(Buffer.from(await fs.readFile(path.join(__dirname, '../build/index.html')))).digest('base64');
    
    if (webSha != awaytoConfig.webSha) {
      awaytoConfig.webSha = webSha;
      
      console.log('Deploying updated webapp.');
      
      child_process.execSync(`aws s3 sync ./build s3://${awaytoConfig.awaytoId}-webapp`, { stdio: 'inherit' });
      child_process.execSync(`aws cloudfront create-invalidation --distribution-id  ${awaytoConfig.distributionId} --paths "/*"`, { stdio: 'inherit' });
    }
    
    await fs.writeFile(seedPath, JSON.stringify(awaytoConfig));
  } catch (error) {
    console.log('Error releasing codebases:', error);
  }

  process.exit();
};

export default release;

if (process.argv[2] == "--awayto-id" && process.argv[3]?.length) {
  release({ awaytoId: process.argv[3] })
}