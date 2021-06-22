const electron = require('electron');

const fs = require('fs-extra');
const $ = require('jquery');
const _ = require('lodash')
const bootstrap = require('bootstrap/dist/js/bootstrap')

var ace = require('brace')
require('brace/mode/text')
require('brace/theme/monokai')
require('brace/theme/github')
require('brace/ext/searchbox')

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
  fs,
  $,
  _,
  bootstrap,
  server,
  finder,
  ace,
}
/*...*/