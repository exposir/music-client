/**
 * This file is used specifically and only for development. It enables the use of ES6+
 * features for the main process and installs `electron-debug` & `vue-devtools`. There
 * shouldn't be any need to modify this file, but it can be used to extend your
 * development environment.
 */

/* eslint-disable no-console */

// Set babel `env` and install `babel-register`
process.env.NODE_ENV = 'development'
// process.env.BABEL_ENV = 'main'

// require('babel-register')({
//   ignore: /node_modules/
// })

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// Install `vue-devtools`
// require('electron').app.on('ready', () => {
//   let browser = require('electron').BrowserWindow
//   let installed = browser.getDevToolsExtensions().hasOwnProperty('Vue.js devtools')
//   if (!installed) {
//     browser.addDevToolsExtension('./tools/vue-devtools/')
//   }
      
//   console.log('installed extention:', browser.getDevToolsExtensions())
// })

// Require `main` process to boot app
require('./index')
