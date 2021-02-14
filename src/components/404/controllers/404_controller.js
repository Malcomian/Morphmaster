module.exports = function ($scope, $rootScope) {
  /*+++*/
  // var vm = $scope
  // var root = $rootScope
  /*...*/
  /*---*/
  var vm = {}
  var root = require('../../_main/controllers/_main_controller')
  /*...*/

  vm.get_url = () => {
    return decodeURI(window.location.hash)
  }
}
