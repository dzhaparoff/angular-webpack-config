/**
 * Webpack helpers & dependencies
 */
const webpackMerge = require('webpack-merge');

const definePlugin = require('webpack/lib/DefinePlugin'),
  checkerPlugin = require('awesome-typescript-loader').CheckerPlugin,
  contextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin'),
  angularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin,
  loaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin'),
  assetsPlugin = require('assets-webpack-plugin'),
  htmlWebpackPlugin = require('html-webpack-plugin'),
  extractTextPlugin = require('extract-text-webpack-plugin'),
  scriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const defaultConfig = function (options, root, settings) {
  const PORT = settings.port[options.platform];

  return {
    /**
     * Cache generated modules and chunks to improve performance for multiple incremental builds.
     * This is enabled by default in watch mode.
     * You can pass false to disable it.
     *
     * See: http://webpack.github.io/docs/configuration.html#cache
     */
    //cache: false,

    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {
      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path: root(settings.paths.public.assets.root),
      publicPath: `/${settings.publicPaths.assets}`
    },

    /**
     * Options affecting the resolving of modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve
     */
    resolve: {
      /**
       * An array of extensions that should be used to resolve modules.
       *
       * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
       */
      extensions: ['.ts', '.js', '.json'],

      // An array of directory names to be resolved to the current directory
      modules: [
        root('node_modules'),
        root()
      ]
    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       */
      // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
      new definePlugin({
        'process.env': {
          'HOST': JSON.stringify(settings.host),
          'PORT': JSON.stringify(PORT)
        }
      }),

      /**
       * Plugin: CheckerPlugin
       * Description: Do type checking in a separate process, so webpack don't need to wait.
       *
       * See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
       */
      new checkerPlugin(),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new loaderOptionsPlugin({
        options: {
          tslint: {
            failOnHint: false
          }
        }
      })
    ]
  };
};

const serverConfig = function (root, settings) {
  return {
    target: 'node',

    /**
     * The entry point for the bundle
     * Our Angular app
     *
     * See: http://webpack.github.io/docs/configuration.html#entry
     */
    entry: root(`${settings.paths.src.server.root}/server.ts`),

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
      filename: 'server.js',

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: 'server.bundle.map',

      /**
       * The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename: 'server.[id].chunk.js',

      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path: root(settings.paths.server)
    },

    /**
     * Options affecting the normal modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#module
     */
    module: {
      rules: [
        /**
         * tslint-loader
         *
         * See: https://github.com/wbuchwalter/tslint-loader
         */
        {
          enforce: 'pre',
          test: /\.ts$/,
          use: 'tslint-loader',
          exclude: [
            root('node_modules'),
            /\.(ngfactory|ngstyle)\.ts$/
          ]
        },

        /**
         * @ngtools/webpack for *.ts
         *
         * See: https://github.com/angular/angular-cli
         */
        {
          test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
          loader: '@ngtools/webpack',
          exclude: [/\.(spec|e2e)\.ts$/]
        },

        /**
         * to-string-loader, css-loader and sass-loader for *.scss
         *
         * See: https://github.com/gajus/to-string-loader
         * See: https://github.com/webpack-contrib/css-loader
         * See: https://github.com/webpack-contrib/sass-loader
         */
        {
          test: /\.scss$/,
          use: ['to-string-loader', 'css-loader', 'sass-loader'],
          exclude: [root(`${settings.paths.src.client.root}/index.html`)]
        },

        /**
         * raw-loader for all other files
         *
         * See: https://github.com/webpack/html-loader
         */
        {
          test: /\.(html)$/,
          use: 'raw-loader'
        },
        {
          test: /\.(png|jpg|jpe?g|gif|ico)$/,
          use: 'raw-loader'
        },
        {
          test: /\/fonts\//,
          use: 'raw-loader'
        }
      ]
    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /**
       * Plugin: ContextReplacementPlugin
       * Description: Provides context to Express (avoids `the request of a dependency is an expression` message)
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
       */
      new contextReplacementPlugin(/express([\\\/])lib/, root(settings.paths.src.root)),

      /**
       * Plugin: AngularCompilerPlugin
       * Description: Webpack 4.0 plugin that AoT compiles your Angular components and modules.
       *
       * See: https://github.com/angular/devkit
       */
      new angularCompilerPlugin({
        tsConfigPath: './tsconfig.json',
        entryModule: root(`${settings.paths.src.server.app}/app.server.module#AppServerModule`),
        skipCodeGeneration: true
      })
    ],

    /**
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global: true,
      crypto: true,
      __dirname: true,
      __filename: true,
      process: true,
      Buffer: true
    }
  };
};

const browserConfig = function (options, root, settings) {
  const isProd = options.env === 'prod' || options.env === 'production';

  return {
    target: 'web',

    /**
     * Options affecting the normal modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#module
     */
    module: {
      rules: [
        /**
         * tslint-loader
         *
         * See: https://github.com/wbuchwalter/tslint-loader
         */
        {
          enforce: 'pre',
          test: /\.ts$/,
          use: 'tslint-loader',
          exclude: [
            root('node_modules'),
            /\.(ngfactory|ngstyle)\.ts$/
          ]
        },

        /**
         * @ngtools/webpack, ng-router-loader, awesome-typescript-loader and angular2-template-loader for *.ts
         *
         * See: https://github.com/angular/angular-cli
         * See: https://github.com/shlomiassaf/ng-router-loader
         * See: https://github.com/s-panferov/awesome-typescript-loader
         * See: https://github.com/TheLarkInn/angular2-template-loader
         */
        {
          test: /\.ts$/,
          use: isProd
            ? '@ngtools/webpack'
            : [
              'ng-router-loader',
              'awesome-typescript-loader?declaration=false',
              'angular2-template-loader'
            ],
          exclude: [/\.(spec|e2e)\.ts$/]
        },

        /**
         * style-loader, css-loader and sass-loader for *.scss
         * bundles in an external file
         *
         * See: https://github.com/webpack-contrib/style-loader
         * See: https://github.com/webpack-contrib/css-loader
         * See: https://github.com/webpack-contrib/sass-loader
         */
        {
          test: /\.scss$/,
          include: [
            root(settings.paths.src.client.assets.sass),
            root('node_modules')
          ],
          use: isProd
            ? extractTextPlugin.extract({
              fallback: 'style-loader',
              use: `css-loader?minimize!postcss-loader!sass-loader!stylefmt-loader?config=${settings.paths.tools.config}/stylelint.config.js`
            })
            // TODO: temporarily disabled for sourcemaps interference
            // : ['style-loader','css-loader?sourceMap','sass-loader?sourceMap'],
            : ['style-loader', 'css-loader', 'sass-loader']
        },

        /**
         * to-string-loader, css-loader and sass-loader for *.scss
         *
         * See: https://github.com/gajus/to-string-loader
         * See: https://github.com/webpack-contrib/css-loader
         * See: https://github.com/webpack-contrib/sass-loader
         */
        {
          test: /\.scss$/,
          include: root(settings.paths.src.client.app.root),
          use: isProd
            ? [
              'to-string-loader',
              'css-loader?minimize',
              'postcss-loader',
              'sass-loader?minimize',
              `stylefmt-loader?config=${settings.paths.tools.config}/stylelint.config.js`
            ]
            // TODO: temporarily disabled for sourcemaps interference
            // : ['to-string-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap']
            : ['to-string-loader', 'css-loader', 'sass-loader']
        },

        /**
         * html-loader for *.html
         *
         * See: https://github.com/webpack/html-loader
         */
        {
          test: /\.html$/,
          use: 'html-loader',
          exclude: [root(`${settings.paths.src.client.root}/index.html`)]
        },

        /**
         * file-loader for images
         *
         * See: https://github.com/webpack-contrib/file-loader
         */
        {
          test: /\.(png|jpg|jpe?g|gif|ico)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: `[name].[hash].[ext]`,
                outputPath: `${settings.publicPaths.images}`
              }
            }
          ]
        },

        /**
         * file-loader for fonts
         *
         * See: https://github.com/webpack-contrib/file-loader
         */
        {
          test: /\/fonts\//,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: `[name].[hash].[ext]`,
                outputPath: `${settings.publicPaths.fonts}`
              }
            }
          ]
        }
      ]
    },

    /**
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      /**
       * Plugin: AssetsPlugin
       * Description: Emits a json file with assets paths.
       *
       * See: https://github.com/kossnocorp/assets-webpack-plugin
       */
      new assetsPlugin({
        path: root(settings.paths.public.assets.root),
        filename: 'webpack-assets.json',
        prettyPrint: true
      }),

      /**
       * Plugin: HtmlWebpackPlugin
       * Description: Simplifies creation of HTML files to serve your webpack bundles.
       * This is especially useful for webpack bundles that include a hash in the filename
       * which changes every compilation.
       *
       * See: https://github.com/ampedandwired/html-webpack-plugin
       */
      new htmlWebpackPlugin({
        template: root(`${settings.paths.src.client.root}/index.html`),
        chunks: isProd
          ? ['polyfills', 'app']
          : ['polyfills', 'vendor', 'app'],
        chunksSortMode: 'manual',
      }),

      /**
       * Plugin: ExtractTextPlugin
       * Description: Extracts text from bundle into a file.
       *
       * See: https://github.com/webpack/extract-text-webpack-plugin
       */
      new extractTextPlugin(`[name]${isProd ? '.[chunkhash]' : ''}.style.css`),

      /**
       * Plugin: ScriptExtHtmlWebpackPlugin
       * Description: Enhances html-webpack-plugin functionality
       * with different deployment options for your scripts including:
       *
       * See: https://github.com/numical/script-ext-html-webpack-plugin
       */
      new scriptExtHtmlWebpackPlugin({
        defaultAttribute: 'defer'
      })
    ],

    /**
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      fs: 'empty'
    }
  };
};

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function (options, root, settings) {
  return webpackMerge(defaultConfig(options, root, settings), options.platform === 'server' ? serverConfig(root, settings) : browserConfig(options, root, settings));
};
