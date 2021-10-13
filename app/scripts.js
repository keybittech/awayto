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


const webpack = require('webpack');
const config = require('./webpack.config');

(async function() {
  webpack(config, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }
  
    const info = stats.toJson();
  
    if (stats.hasErrors()) {
      console.error(info.errors);
    }
  
    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }
  
    // Log result...
  })
})()



