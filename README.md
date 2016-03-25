### React Hot Loader + Browsersync


**[React Hot Loader](https://gaearon.github.io/react-hot-loader/getstarted/)** を使えば、エディタを保存した時点で、React コンポーネントの変更が検知され、ブラウザの更新が自動で行われます。さらに、**React Hot Loader** はHotModuleReplacementPlugin(**HMR**) を使用しているため、更新時にページの全読み込みが発生せず、state が保持されたまま React コンポーネントの変更した箇所のみが部分更新されるため、いちいち手動でブラウザをリロードする手間が省けることに加え、チェック毎に state を変える必要がなくなります。


通常はデベロップメントサーバーに **webpack-dev-server** を使うことで、このホットリローディング機能を使うことができるのですが、今回は **[Browsersync](https://www.browsersync.io/)** を使って、クロスブラウジングとさらなるホットリローディングの強化を目指します。


まずは必要な物をインストールします。`package.json` は次のようになります。

```javascript
"dependencies": {
  "react": "^0.13.3",
  "react-dom": "^0.14.7"
},
"devDependencies": {
  "babel-core": "^5.8.38",
  "babel-loader": "^5.4.0",
  "browser-sync": "^2.11.2",
  "react-hot-loader": "^1.3.0",
  "webpack": "^1.12.14",
  "webpack-dev-middleware": "^1.5.1",
  "webpack-hot-middleware": "^2.10.0"
}
```

通常の **React Hot Loader** に必要なライブラリに加えて **Browsersync** と `webpack-hot-middleware` と `webpack-dev-middleware` の ふたつのミドルウェアをインストールしておきます。**webpack** のホットリローディングは `webpack-dev-middleware` がファイル変更イベントを検知して `webpack-dev-server` に送信することで可能になりますが、 `webpack-hot-middleware` を合わせて使うことで、その他のデベロップメントサーバーにイベントを送信して、自動でブラウザをリロードさせることができます。

# webpack config

プロジェクトファイルの構成:
```
|___app/
|     |___main.jsx
|___dist/
|     |___css/
|     |___index.html
|___server.js
|___webpack.config.js
```


まずは `webpack.config.js` を編集します。

下記は **React Hot Loader** での `webpack.config.js` です。

```javascript
// React Hot Loader
var webpack = require('webpack');
var path = require('path');

module.exports = {
  debug: true,
  devtool: '#eval-source-map',

  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './app/main.jsx'
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],

  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['react-hot', 'babel'] }
    ]
  }
};
```

ここに、プラグインを2つ加えます。

```javascript
plugins: [
    // Webpack 1.0
    new webpack.optimize.OccurenceOrderPlugin(),
    // Webpack 2.0 fixed this mispelling
    // new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
]
```

また、`webpack-hot-middleware/client` をエントリーポイントに設定します。

したがって、`webpack.config.js` ファイルは次のようになります。

```javascript
var webpack = require('webpack');
var path = require('path');

module.exports = {
  debug: true,
  devtool: '#eval-source-map',

  entry: [
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
```

### Browsersync

サーバーに、ミドルウェアを加えます。`server.js` ファイルは次のようになります。

```javascript
/**
 * Require Browsersync along with webpack and middleware for it
 */
var browserSync = require('browser-sync');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

var webpackConfig = require('./webpack.config');
var bundler = webpack(webpackConfig);

browserSync({
    server: {
      baseDir: 'dist',

      middleware: [
        webpackDevMiddleware(bundler, {
          publicPath: webpackConfig.output.publicPath,
          stats: { colors: true }
          // http://webpack.github.io/docs/webpack-dev-middleware.html
        }),

        webpackHotMiddleware(bundler)
      ]
    },

    files: [
      'dist/css/*.css',
      'dist/*.html'
    ]
});
```

- `baseDir`: サーバーのベースとなるディレクトリ。
- `middleware`: 使用するミドルウェア。`devMiddleware`では`publicPath`の指定が必須となります。
- `files`: **Browsersync** が変更を監視するファイル群。変更がなされると、ページ全体をリロードします。`js` ファイル群の監視は **webpack** に任せるので、ここに記述する必要はありません。

### クロスブラウジング

次のコマンドで、サーバーが立ち上がります。

```
node server.js
```

同時に、次のような URL が表示されます。

```

[BS] Access URLs:
 ------------------------------------
       Local: http://localhost:3000
    External: http://{PCのIPアドレス}:3000
 ------------------------------------
          UI: http://localhost:3001
 UI External: http://{PCのIPアドレス}:3001
 ------------------------------------

```


この URL に繋げば、同じネットワークに接続している他のデバイスからも、ブラウジングすることができます。
モバイルデバイスからの UI や UX のチェックに便利です。
