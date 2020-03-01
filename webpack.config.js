const path = require('path');
const slsw = require('serverless-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.d.ts'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  externals: { 
    'chrome-aws-lambda': 'chrome-aws-lambda',
    knex: 'commonjs knex' 
  },
  plugins: [

    new CopyWebpackPlugin([
      { from: './migrations/*.js', to: '' },
      { from: 'node_modules/chrome-aws-lambda', to: 'node_modules/chrome-aws-lambda' }
    ])
],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
};
