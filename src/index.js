/*---*/
console.log(`Remove this at build!`)
/*...*/

const {
  shell,
  clipboard,
  webFrame,
  remote,
  nativeImage,
  ipcRenderer
} = require('electron');

const fs = require('fs-extra');
const $ = require('jquery');
const Popper = require('popper.js');
const Bootstrap = require('bootstrap');
const _ = require('lodash')

// ? prevent default drag behavior so that links aren't weird
$('*').on('dragstart', (event) => {
  event.preventDefault();
})

// ? start the angular app
const Server = require('./models/server');
var server = new Server();

/*---*/
console.log(`Remove this at build!`)
module.exports = {
  shell: shell,
  clipboard: clipboard,
  webFrame: webFrame,
  remote: remote,
  nativeImage: nativeImage,
  ipcRenderer: ipcRenderer,
  fs: fs,
  $: $,
  Popper: Popper,
  Bootstrap: Bootstrap,
  server: server,
  finder,
  _
}
/*...*/