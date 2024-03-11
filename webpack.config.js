const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
    jQuery: 'jquery'
  }),
  ],
  output: {
    filename: 'replay_bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};