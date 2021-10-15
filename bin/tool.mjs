import readline from 'readline';
import fs from 'fs/promises';

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q, pattern) => new Promise((resolve, reject) => {
  rl.question(pattern ? `${q} Invalid Characters: ${pattern}\n> ` : q, async function (answer) {
    if (pattern && pattern.test(answer)) {
      console.log('Invalid character found.\n');
      resolve(await ask(q, pattern));
    }
    resolve(answer);
  });
})

const replaceText = (file, from, to) => new Promise(async (resolve, reject) => {

  try {

    const oldFile = await fs.readFile(file, 'utf8');
    
    var result = oldFile.replaceAll(`##${from}##`, to);
  
    await fs.writeFile(file, result, 'utf8');
  
    resolve();

  } catch (error) {
    console.log('error replacing text', error);
    reject();
  }

});

const asyncForEach = async (array, callback) => {
  if (array && array.length) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
}

export { ask, replaceText, asyncForEach };