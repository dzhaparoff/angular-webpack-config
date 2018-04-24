/**
 * Webpack helpers & dependencies
 */
const commonConfig = require('./webpack.common'),
  webpackMerge = require('webpack-merge');

const hardSourceWebpackPlugin = require('hard-source-webpack-plugin'),
  loaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin'),
  contextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';

const defaultConfig = function(settings) {
  return {
    mode: 'development',

    /**
     * Developer tool to enhance debugging
     *
     * See: http://webpack.github.io/docs/configuration.html#devtool
     * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
     */
    devtool: settings.webpack.devtool.DEV,

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /**
       * Plugin: HardSourceWebpackPlugin
       * Description: Provides intermediate caching step for modules
       *
       * See: https://github.com/mzgoddard/hard-source-webpack-plugin
       */
      new hardSourceWebpackPlugin(),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new loaderOptionsPlugin({
        debug: true
      })
    ]
  };
};

const browserConfig = function(root, settings) {
  return {
    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {
      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: http://webpack.github.io/docs/configuration.html#output-filename
       */
      filename: '[name].bundle.js',

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '[name].map',

      /** The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename: '[id].chunk.js',

      libraryTarget: 'var',
      library: '_awc'
    },

    /**
     * Options affecting the development experience versus performance of the compilation
     *
     * See: https://webpack.js.org/plugins/split-chunks-plugin/#optimization-splitchunks
     */
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            enforce: true
          }
        }
      }
    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new loaderOptionsPlugin({
        options: {
          context: root()
        }
      }),

      /**
       * Plugin: ContextReplacementPlugin
       * Description: Provides context to Angular (avoids `the request of a dependency is an expression` message)
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
       * See: https://github.com/angular/angular/issues/11580
       */
      new contextReplacementPlugin(/angular(\\|\/)core(\\|\/)/, root(settings.paths.src.root))
    ]
  };
};

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function(options, root, settings) {
  return webpackMerge(commonConfig({
    env: ENV,
    platform: options.platform
  }, root, settings), defaultConfig(settings), options.platform === 'server' ? {} : browserConfig(root, settings));
};
