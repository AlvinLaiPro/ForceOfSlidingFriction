var path = require('path')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var StyleLintPlugin = require('stylelint-webpack-plugin')
var webpack = require('webpack')
var ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin')

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['es2015', 'stage-0'],
          plugins: ['transform-runtime']
        }
      },
      {
        test: require.resolve('snapsvg'),
        use: 'imports-loader?this=>window,fix=>module.exports=0'
      },
      {
        test: /\.(s?css)$/,
        include: [path.resolve(__dirname, 'src')],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.(png|jpg|ico)$/,
        loader: 'file-loader?name=./resources/images/[name].[ext]'
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
      }
    ]
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, 'src')],
    alias: {
      TweenLite: 'gsap/src/minified/TweenLite.min.js',
      TimelineMax: 'gsap/src/minified/TimelineMax.min.js'
    },
    extensions: ['.js']
  },
  plugins: [
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/worker.js')
    }),
    new webpack.LoaderOptionsPlugin({ debug: true }),
    /*new StyleLintPlugin({
            syntax: 'scss'
        }),*/
    new ExtractTextPlugin({ filename: 'styles.css', allChunks: true }),
    new HtmlWebpackPlugin({
      favicon: 'src/resources/favicon.ico',
      template: path.resolve(__dirname, 'src/index.html'),
      title: 'ForceOfSlidingFriction',
      css: ['styles.css']
    }),
    new CleanWebpackPlugin(['docs']),
    new CopyWebpackPlugin(
      [
        {
          from: __dirname + '/src/resources',
          to: __dirname + '/docs/resources'
        }
      ],
      {
        copyUnmodified: true
      }
    ),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
}
