// Keep at top
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, `settings.${process.env.NODE_ENV}.env`) })
dotenv.config({ path: path.join(__dirname, `settings.application.env`) })

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const debug = process.env.NODE_ENV !== 'production';

module.exports = {
  context: __dirname,
  entry: path.resolve(__dirname, 'src/api/index.ts'),
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'apiout'),
    filename: 'index.js',
    library: "index",
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      'awayto': path.resolve(__dirname, 'src/core'),
      'awayto/types': path.resolve(__dirname, 'types')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      }
    ],
  },
  target: 'node',
  externals: [ nodeExternals() ],
  optimization: {
    minimize: true
  }
};