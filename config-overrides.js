// Keep at top
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, `settings.${process.env.NODE_ENV}.env`) })
dotenv.config({ path: path.join(__dirname, `settings.application.env`) })

const crypto = require('crypto');
const fs = require('fs');
const glob = require('glob');
const express = require('express');
const { alias, configPaths } = require("react-app-rewire-alias");
const { useBabelRc, addWebpackPlugin, override, addWebpackAlias } = require("customize-cra");
const CircularDependencyPlugin = require('circular-dependency-plugin');
const multipleEntry = require('react-app-rewire-multiple-entry')([
  {
    entry: 'src/webapp/index.tsx'
  }
]);

const { AWAYTO_CORE, AWAYTO_WEBAPP_MODULES } = process.env;
const getN = n => ({ [`${n[n.length - 1].split('.')[0]}`]: `${n[n.length - 3]}/${n[n.length - 2]}/${n[n.length - 1].split('.')[0]}` }) // returns { 'MyThing': 'common/views/bla' }

const filePath = path.resolve(__dirname + AWAYTO_CORE + '/build.json');
const globOpts = {
  cache: false,
  statCache: false
};

try {
  if (!fs.existsSync(filePath))
    fs.closeSync(fs.openSync(filePath, 'w'));
} catch (error) { }

function storeResource(path) {
  return glob.sync(path, globOpts).map((m) => getN(m.split('/'))).reduce((a, b) => ({ ...a, ...b }), {});
}

let oldHash;

function checkWriteBuildFile(next) {
  try {
    const files = JSON.stringify({
      views: storeResource('.' + AWAYTO_WEBAPP_MODULES + '/**/views/*.tsx'),
      reducers: storeResource('.' + AWAYTO_WEBAPP_MODULES + '/**/reducers/*.ts')
    });

    const newHash = crypto.createHash('sha1').update(Buffer.from(files)).digest('base64');
    
    if (oldHash != newHash) {
      oldHash = newHash;
      fs.writeFile(filePath, files, () => next && next())
    } else {
      next && next()
    }
  } catch (error) {
    console.log('error!', error)
  }
}

checkWriteBuildFile();

module.exports = {
  
  webpack: function (config, env) {
    
    multipleEntry.addMultiEntry(config);

    useBabelRc()(config);

    addWebpackPlugin(new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/,
      include: /src/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    }))(config);

    alias(configPaths('./tsconfig.paths.json'))(config);


    override(
      addWebpackAlias({
        'awaytodev': path.resolve(__dirname, AWAYTO_CORE)
      })
    )

    return config;
  },
  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.before = function (app, server, compiler) {
        app.use(express.static(__dirname + AWAYTO_CORE, {
          etag: false
        }));
        app.use((req, res, next) => {
          checkWriteBuildFile(next)
        });
      }
      return config;
    };
  },
  paths: function(paths, env) {
    paths.appTypescriptSrc = path.resolve(__dirname, "src/core/types/index.d.ts");
    paths.appIndexJs = path.resolve(__dirname, "src/webapp/index.tsx");
    paths.appSrc = path.resolve(__dirname, "src");
    return paths;
  },
}
