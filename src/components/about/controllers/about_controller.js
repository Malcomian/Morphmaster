module.exports = function ($scope, $rootScope) {
  /*+++*/
  // var vm = $scope
  // var root = $rootScope
  /*...*/
  /*---*/
  var vm = {}
  var root = require('../../_main/controllers/_main_controller')
  /*...*/

  $('#readme').html(root.md('../readme.md'))
}
