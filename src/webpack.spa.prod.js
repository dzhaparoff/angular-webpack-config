/**
 * Webpack helpers & dependencies
 */
const defaultConfig = require('./webpack.spa.common'),
  prodConfig = require('./webpack.common.prod'),
  webpackMerge = require('webpack-merge');

const angularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function(root, settings) {
  return webpackMerge(defaultConfig({ env: 'prod' }, root, settings), prodConfig({platform: 'browser'}, root, settings), {
    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /**
       * Plugin: AngularCompilerPlugin
       * Description: Webpack 4.0 plugin that AoT compiles your Angular components and modules.
       *
       * See: https://github.com/angular/devkit
       */
      new angularCompilerPlugin({
        tsConfigPath: './tsconfig.json',
        entryModule: root(`${settings.paths.src.client.app.root}/app.module#AppModule`)
      })
    ]
  });
};
