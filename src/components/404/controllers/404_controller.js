module.exports = function ($scope, $rootScope) {
  // ! INSERT ! //
  // var vm = $scope
  // var root = $rootScope
  // ! END-INSERT ! //
  // ! REMOVE ! //
  var vm = {}
  var root = require('../../_main/controllers/_main_controller')
  // ! END-REMOVE ! //

  vm.get_url = () => {
    let hash = window.location.hash
    hash = hash.split('%20').join(' ')
    return hash
  }
}
