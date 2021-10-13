// Keep at top
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, `settings.${process.env.NODE_ENV}.env`) })
dotenv.config({ path: path.join(__dirname, `settings.application.env`) })

const fs = require('fs');
const webpack = require('webpack');
const resolve = require('resolve');
const { alias, configPaths } = require("react-app-rewire-alias");
const { useBabelRc, addWebpackPlugin, override, addWebpackAlias } = require("customize-cra");
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

const { AWAYTO_CORE, AWAYTO_TYPES } = process.env;

const filePath = path.resolve(__dirname + AWAYTO_CORE + '/build.json');
fs.writeFileSync(filePath, '{}');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL
);

function getClientEnvironment(publicUrl) {
  const raw = Object.keys(process.env)
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PUBLIC_URL: publicUrl,
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
        FAST_REFRESH: process.env.FAST_REFRESH !== 'false',
      }
    );
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
}

module.exports = {

  webpack: function (config, env) {

    config.output.path = path.resolve(__dirname, 'apibuildtest');
    config.output.filename = 'index.js';
    config.output.library = 'index';
    config.output.libraryTarget = 'commonjs2';

    config.module.rules = [
      // { parser: { requireEnsure: false } },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // Process application JS with Babel.
          // The preset includes JSX, Flow, TypeScript, and some ESnext features.
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            include: [path.resolve(__dirname, 'src/core'), path.resolve(__dirname, 'src/api')],
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                [require.resolve('babel-preset-react-app')],
              ],
            },
          },
          // Process any JS outside of the app with Babel.
          // Unlike the application JS, we only compile the standard ES features.
          // {
          //   test: /\.(js|mjs)$/,
          //   exclude: /@babel(?:\/|\\{1,2})runtime/,
          //   loader: require.resolve('babel-loader'),
          //   options: {
          //     babelrc: false,
          //     configFile: false,
          //     compact: false,
          //     presets: [
          //       [
          //         require.resolve('babel-preset-react-app/dependencies'),
          //         { helpers: true },
          //       ],
          //     ],
          //     cacheDirectory: true,
          //     // See #6846 for context on why cacheCompression is disabled
          //     cacheCompression: false,

          //     // Babel sourcemaps are needed for debugging into node_modules
          //     // code.  Without the options below, debuggers like VSCode
          //     // show incorrect code and set breakpoints on the wrong lines.
          //     sourceMaps: false,
          //     inputSourceMap: false,
          //   },
          // },
          {
            loader: require.resolve('file-loader'),
            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            }
          }
        ]
      },
    ]

    const { stringified } = getClientEnvironment(publicUrlOrPath.slice(0, -1));

    config.plugins = [
      new webpack.DefinePlugin(stringified),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      })
      // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      // new MiniCssExtractPlugin(),
      // new ForkTsCheckerWebpackPlugin({
      //   typescript: resolve.sync('typescript', {
      //     basedir: path.resolve(__dirname, "node_modules"),
      //   }),
      //   async: false,
      //   checkSyntacticErrors: true,
      //   tsconfig: path.resolve(__dirname, "tsconfig.json"),
      //   silent: true,
      //   // The formatter is invoked directly in WebpackDevServerUtils during development
      //   formatter: typescriptFormatter,
      // }),
      // new ESLintPlugin({
      //   // Plugin options
      //   extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
      //   formatter: require.resolve('react-dev-utils/eslintFormatter'),
      //   eslintPath: require.resolve('eslint'),
      //   failOnError: true,
      //   context: path.resolve(__dirname, "src/api"),
      //   cache: true,
      //   cacheLocation: path.resolve(
      //     path.resolve(__dirname, "node_modules"),
      //     '.cache/.eslintcache'
      //   ),
      //   // ESLint class options
      //   cwd: path.resolve(__dirname, "src/api"),
      //   resolvePluginsRelativeTo: __dirname,
      //   baseConfig: {
      //     extends: [require.resolve('eslint-config-react-app/base')]
      //   },
      // })
    ]

    // config.module.rules[1].oneOf.unshift({
    //   test: /\.(ts)$/,
    //   include: [path.resolve(__dirname, 'src/core'), path.resolve(__dirname, 'src/api')],
    //   loader: require.resolve('babel-loader'),
    //   options: {
    //     customize: require.resolve('babel-preset-react-app/webpack-overrides'),
    //     presets: [
    //       [
    //         require.resolve('babel-preset-react-app'),
    //         {
    //           runtime: 'automatic'
    //         },
    //       ],
    //     ],

    //     plugins: [
    //       [
    //         require.resolve('babel-plugin-named-asset-import'),
    //         {
    //           loaderMap: {
    //             svg: {
    //               ReactComponent:
    //                 '@svgr/webpack?-svgo,+titleProp,+ref![path]',
    //             },
    //           },
    //         },
    //       ],
    //     ].filter(Boolean),
    //     // This is a feature of `babel-loader` for webpack (not Babel itself).
    //     // It enables caching results in ./node_modules/.cache/babel-loader/
    //     // directory for faster rebuilds.
    //     cacheDirectory: true,
    //     // See #6846 for context on why cacheCompression is disabled
    //     cacheCompression: false,
    //     compact: true,
    //   },
    // })

    // addWebpackPlugin(new CircularDependencyPlugin({
    //   exclude: /a\.js|node_modules/,
    //   include: /src/,
    //   failOnError: true,
    //   allowAsyncCycles: false,
    //   cwd: process.cwd(),
    // }))(config);

    alias(configPaths('./tsconfig.api.json'))(config);
    alias(configPaths('./tsconfig.paths.json'))(config);

    override(
      addWebpackAlias({
        'awayto': path.resolve(__dirname, AWAYTO_CORE),
        'awayto/types': path.resolve(__dirname, AWAYTO_TYPES)
      })
    )
    ,
    
    // config.output = {
    //   path: path.join(__dirname, 'apibuildtest'),
    //   filename: 'index.js',
    //   // library: "index",
    //   // libraryTarget: 'commonjs2'
    // }

    config.optimization = {
      minimize: true,
      // minimizer: [
      //   new TerserPlugin({
      //     terserOptions: {
      //       ecma: 2017,
      //       compress: false,
      //       mangle: false,
      //       keep_fnames: true
      //     }
      //   })
      // ],
      splitChunks: false,
      runtimeChunk: false
    }

    config.target = 'node';

    config.node = {};

    const nodeExternals = require('webpack-node-externals');
    return {
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
            options: {
              configFile: 'tsconfig.api.json',
              reportFiles: ['src/**/*.{ts,tsx}', '!**/*.d.ts']
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
  },
  paths: function (paths, env) {
    paths.appTsConfig = path.resolve(__dirname, 'tsconfig.api.json');
    paths.appIndexJs = path.resolve(__dirname, "src/api/index.ts");
    paths.appSrc = path.resolve(__dirname, "src/api");
    return paths;
  },
}
