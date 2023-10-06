const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { version: APP_VERSION } = require('./package.json');

const OUTPUT = './public';
const SRC_ROOT = './src';

module.exports = {
  context: path.resolve(__dirname, SRC_ROOT),
  entry: {
    app: './index.js',
  },
  output: {
    path: path.resolve(__dirname, OUTPUT),
    filename: '[hash:8].js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      '@root': path.resolve(SRC_ROOT),
    },
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env', 'es2015', 'stage-0', 'react'],
          plugins: ['styled-components'],
        },
      },
    }, {
      test: /\.(gif|png|jpe?g|svg)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[hash:8].[ext]',
            outputPath: 'images/',
          },
        },
        {
          loader: 'image-webpack-loader',
          options: {
            bypassOnDebug: true, // webpack@1.x
            disable: true, // webpack@2.x and newer
          },
        },
      ],
    }],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, SRC_ROOT, 'public/'),
        to: path.resolve(__dirname, OUTPUT),
      },
    ]),
    new HtmlWebpackPlugin({
      title: 'Sample',
      template: path.resolve(__dirname, SRC_ROOT, 'index.html'),
      pkgVer: JSON.stringify(APP_VERSION),
      favicon: path.resolve(__dirname, SRC_ROOT, 'images/favicon.png'),
    }),
  ],
};
