/*---*/
const {
  electron,
  fs,
  $,
  bootstrap,
  server,
  _,
  ace,
} = require('../../../index')
/*...*/

module.exports = function ($scope, $rootScope) {
  /*+++*/
  // var vm = $scope
  // var root = $rootScope
  /*...*/
  /*---*/
  var vm = {}
  var root = require('../../_main/controllers/_main_controller')
  /*...*/

  root.md.get('../readme.md', (data) => {
    $('#readme').html(root.md.render(data))
  })
}
