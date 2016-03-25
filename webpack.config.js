// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
var webpack = require('webpack');
var path = require('path');

module.exports = {
  debug: true,
  devtool: '#eval-source-map',

  entry: [
    // WebpackDevServer host and port
    // 'webpack-dev-server/client?http://localhost:3000,
    // 'webpack/hot/only-dev-server',
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client',
    './app/main.jsx'
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],

  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['react-hot', 'babel'] }
    ]
  }
};
