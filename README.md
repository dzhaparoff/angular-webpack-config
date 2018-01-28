# angular-webpack-config [![npm version](https://badge.fury.io/js/angular-webpack-config.svg)](https://www.npmjs.com/package/angular-webpack-config) [![npm downloads](https://img.shields.io/npm/dm/angular-webpack-config.svg)](https://www.npmjs.com/package/angular-webpack-config)

Shared [Webpack] config for [Angular] SPA/Universal development (w/Dll Bundles, Hard Source plugins)

[![CircleCI](https://circleci.com/gh/ng-seed/angular-webpack-config.svg?style=shield)](https://circleci.com/gh/ng-seed/angular-webpack-config)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Greenkeeper badge](https://badges.greenkeeper.io/ng-seed/angular-webpack-config.svg)](https://greenkeeper.io/)

> Please support this project by simply putting a Github star. Share this library with friends on Twitter and everywhere else you can.

## Table of contents:
- [Getting started](#getting-started)
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## <a name="getting-started"></a> Getting started
### <a name="installation"></a> Installation
You can install **`angular-webpack-config`** using `npm`
```
npm install angular-webpack-config --save
```

**Note**: You should have already installed [Webpack].

## <a name="usage"></a> Usage
To use this [Webpack] **configuration preset**, you should first have a **`build-config.json`** file, with the following structure:

```json5
{
  "host": "localhost", // hostname of your app
  "port": {
    "browser": 1337, // port number (browser bundle)
    "server": 8000 // port number (server bundle)
  },
  "root": ".", // root path (default value recommended)
  "paths": { // path to seek for sources (default value recommended)
    "src": {
      "root": "{{root}}/src",
      "client": {
        "root": "{{src_root}}/client",
        "app": {
          "root": "{{src_client_root}}/app" 
        },
        "assets": {
          "root": "{{src_client_root}}/assets",
          "sass": "{{src_assets_root}}/sass"
        }
      },
      "server": {
        "root": "{{src_root}}/server",
        "app": "{{src_server_root}}/app"
      }
    },
    "tools" : {
      "root": "{{root}}/tools",
      "build": "{{tools_root}}/build", // build scripts (gulp, webpack, etc.) 
      "config": "{{tools_root}}/config", // config files (stylelint, postcss, etc.)
      "test": "{{tools_root}}/test" // test scripts (karma, jest, etc.) 
    },
    "public": { // path to extract client bundles (default value recommended)
      "root": "{{root}}/public",
      "assets": {
        "root": "{{public_root}}/assets"
      }
    },
    "server": "{{root}}/.server" // path to extract server bundle (default value recommended)
  },
  "publicPaths": {
    "assets": "assets/", // you can use either `assets/` (relative) or `/assets/` (absolute), or a custom assets path
    "images": "assets/img",
    "fonts": "assets/fonts"
  },
  "webpack": {
    "devtool": { // source maps for each ENV
      "DEV": "cheap-module-source-map",
      "PROD": "source-map",
      "TEST": "inline-source-map"
    },
    "bundles": { // here we specify our bundles for  DLL plugin
      "polyfills": [
        "core-js",
        {
          "name": "zone.js",
          "path": "zone.js/dist/zone.js"
        },
        {
          "name": "zone.js",
          "path": "zone.js/dist/long-stack-trace-zone.js"
        }
      ],
      "server": [
        "express",
        "debug",
        "compression",
        "morgan",
        "body-parser"
      ]
    }
  }
}
``` 

Then in your _task runner_, import the **`angular-webpack-config`** and your **`build-config.json`**:
```javascript
const webpackConfig = require('angular-webpack-config');
const settings = require('./build-config.json');
```

Then simply create a **`root`** function to _resolve the **root path** of your app_ from your task runner:
```javascript
const root = function(args) {
  const ROOT = path.resolve(__dirname, '../..'); // IMPORTANT: adjust per your own directory structure
  args = Array.prototype.slice.call(arguments, 0);

  return path.join.apply(path, [ROOT].concat(args));
};
```

And finally, execute the **`webpackConfig`** function to _**generate** your bundles_:
```javascript
// SPA bundles
webpackConfig.spa.hmr(root, settings); // DEV env + HMR
webpackConfig.spa.dev(root, settings); // DEV env
webpackConfig.spa.prod(root, settings); // PROD env

// UNIVERSAL bundles
webpackConfig.universal.browser.dev(root, settings); // DEV env (browser)
webpackConfig.universal.server.dev(root, settings); // DEV env (server)

webpackConfig.universal.browser.prod(root, settings); // PROD env (browser)
webpackConfig.universal.server.prod(root, settings); // PROD env (server)
```

For live demo, please refer to [ng-seed/universal] repository.

## <a name="contributing"></a> Contributing
If you want to file a bug, contribute some code, or improve documentation, please read up on the following contribution guidelines:
- [Issue guidelines](CONTRIBUTING.md#submit)
- [Contributing guidelines](CONTRIBUTING.md)
- [Coding rules](CONTRIBUTING.md#rules)
- [Change log](CHANGELOG.md)

#### Thanks to
- [JetBrains], for their support to this open source project with free [WebStorm] licenses.

## <a name="license"></a> License
The MIT License (MIT)

Copyright (c) 2018 [Burak Tasci]

[Webpack]: https://github.com/webpack/webpack
[Angular]: https://angular.io
[ng-seed/universal]: https://github.com/ng-seed/universal
[JetBrains]: https://www.jetbrains.com/community/opensource
[WebStorm]:   https://www.jetbrains.com/webstorm
[Burak Tasci]: https://github.com/fulls1z3
