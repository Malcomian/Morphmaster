const electron = require('electron');

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
  electron,
  shell,
  clipboard,
  webFrame,
  remote,
  nativeImage,
  ipcRenderer,
  fs,
  $,
  Popper,
  Bootstrap,
  server,
  finder,
  _
}
/*...*/