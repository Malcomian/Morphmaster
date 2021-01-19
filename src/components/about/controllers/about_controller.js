module.exports = function ($scope, $rootScope) {
  /*+++*/
  // var vm = $scope
  // var root = $rootScope
  /*...*/
  /*+++*/
  var vm = {}
  var root = require('../../_main/controllers/_main_controller')
  /*...*/

  var md = require('../../../models/md')
  $('#readme').html(md.render(md.get('../readme.md')))
}
