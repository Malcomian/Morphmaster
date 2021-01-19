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
    let hash = window.location.hash
    hash = hash.split('%20').join(' ')
    return hash
  }
}
