module.exports = () => {
  return `module.exports = function ($scope, $rootScope) {
  \/\/ ! INSERT ! \/\/
  \/\/ var vm = $scope
  \/\/ var root = $rootScope
  \/\/ ! END-INSERT ! \/\/
  \/\/ ! REMOVE ! \/\/
  var vm = {}
  var root = require('../../_main/controllers/_main_controller')
  \/\/ ! END-REMOVE ! \/\/
}
`
}