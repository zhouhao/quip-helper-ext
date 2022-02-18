const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const { VueLoaderPlugin } = require('vue-loader');
const TerserPlugin = require('terser-webpack-plugin');
const { version } = require('./package.json');

const config = {
  mode: process.env.NODE_ENV,
  context: `${__dirname}/src`,
  entry: {
    background: './background.js',
    'overlay/overlay': './overlay/overlay.js',
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.vue'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.sass$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/images/',
          emitFile: false,
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: '/fonts/',
          emitFile: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyPlugin([
      { from: 'icons', to: 'icons' },
      {
        from: 'manifest.json',
        to: 'manifest.json',
        transform: content => {
          const jsonContent = JSON.parse(content);
          jsonContent.version = version;

          if (process.env.RELEASE !== 'true') {
            jsonContent.key =
              'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAts4JNv72yMw3WZ1OrU3Q4XZ2xiypjCC2ugzT/Ij+dLJbfBitT8r0/tpRJPQ20vvMc7bEWRa8HHuuO4ndWpWAqMZT2Dr/QkhYbPkRVMqdg0dQmuq5iEVpaaJxx9LNzngtSwJuehv7f2AWbbC66Xtemz/rNF+sUtq8erOjmwsBWwT9ry0vo+vrzg0wIUGWvqo7EjExbHe5BcfmsnHjpnHzRPzYBxE408AryooTG0xqBpaafyXaOduYKJ8BtQXwCuoKUANRakeMUEksD5hKS/HB/+/uqHAH6C6MNICroBn4wGVPc1bJ9MYVitZgnWlbpVV3ECvYYY4HO2eCOgVrzp/cIwIDAQAB';
          }
          return JSON.stringify(jsonContent, null, 2);
        },
      },
    ]),
  ],

  // fix js code isn't UTF-8 encoded.
  optimization: {
    // Uncomment below line to no minimize our code.
    // minimize: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: { ascii_only: true },
        },
      }),
    ],
  },
};

if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ]);
}

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ExtensionReloader({
      manifest: `${__dirname}/src/manifest.json`,
    }),
  ]);
}

module.exports = config;
