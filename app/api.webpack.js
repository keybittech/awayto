const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const debug = process.env.NODE_ENV !== 'production';

module.exports = {
  context: __dirname,
  entry: path.resolve(__dirname, './src/api/index.ts'),
  mode: 'production',
  output: {
    path: path.join(__dirname, 'apipkg'),
    filename: 'index.js',
    library: "index",
    libraryTarget: 'commonjs2'
  },
  resolve: {
    alias: {
      awayto: '/src/core/index.ts'
    },
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, './src/api/tsconfig.json')
        }
      }
    ],
  },
  target: 'node',
  externals: [ nodeExternals() ],
  optimization: {
    minimize: true
  }
};