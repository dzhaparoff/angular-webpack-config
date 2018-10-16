/**
 * Webpack helpers & dependencies
 */
const commonConfig = require('./webpack.common'),
  webpackMerge = require('webpack-merge');

const optimizeJsPlugin = require('optimize-js-plugin'),
  loaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin'),
  uglifyJsPlugin = require('uglifyjs-webpack-plugin');

const ENV = process.env.ENV = process.env.NODE_ENV = 'production';

const defaultConfig = function(settings) {
  return {
    mode: 'production',

    /**
     * Developer tool to enhance debugging
     *
     * See: http://webpack.github.io/docs/configuration.html#devtool
     * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
     */
    // devtool: settings.webpack.devtool.PROD,

    /**
     * Options affecting the development experience versus performance of the compilation
     *
     * See: https://webpack.js.org/plugins/no-emit-on-errors-plugin/
     * See: https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
     */
    optimization: {
      noEmitOnErrors: !!settings.minimize,
      minimize: !!settings.minimize
    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /**
       * Webpack plugin to optimize a JavaScript file for faster initial load
       * by wrapping eagerly-invoked functions.
       *
       * See: https://github.com/vigneshshanmugam/optimize-js-plugin
       */
      new optimizeJsPlugin({
        sourceMap: false
      }),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new loaderOptionsPlugin({
        minimize: true,
        debug: false
      })
    ]
  };
};

const browserConfig = function(settings) {
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
      filename: '[name].[chunkhash].bundle.js',

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '[name].[chunkhash].bundle.map',

      /**
       * The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename: '[id].[chunkhash].chunk.js'
    },

    /**
     * Options affecting the development experience versus performance of the compilation
     *
     * See: https://webpack.js.org/plugins/no-emit-on-errors-plugin/
     * See: https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
     */
    optimization: {
      minimizer: !!settings.minimize
        ? [
          new uglifyJsPlugin({
            uglifyOptions: {
              ecma: 5
            }
          })
        ]
        : undefined
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
          /**
           * Html loader advanced options
           *
           * See: https://github.com/webpack/html-loader#advanced-options
           */
          // TODO: Need to workaround Angular's html syntax => #id [bind] (event) *ngFor
          htmlLoader: {
            minimize: true,
            removeAttributeQuotes: false,
            caseSensitive: true,
            customAttrSurround: [
              [/#/, /(?:)/],
              [/\*/, /(?:)/],
              [/\[?\(?/, /(?:)/]
            ],
            customAttrAssign: [/\)?]?=/]
          }
        }
      })
    ]
  };
};

const serverConfig = function(settings) {
  return {
    /**
     * Options affecting the development experience versus performance of the compilation
     *
     * See: https://webpack.js.org/plugins/no-emit-on-errors-plugin/
     * See: https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
     */
    optimization: {
      minimizer: !!settings.minimize
        ? [
          new uglifyJsPlugin({
            uglifyOptions: {
              ecma: 6,
              compress: false,
              mangle: false,
              comments: false
            }
          })
        ]
        : undefined
    }
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
  }, root, settings), defaultConfig(settings), options.platform === 'server' ? serverConfig(settings) : browserConfig(settings));
};
