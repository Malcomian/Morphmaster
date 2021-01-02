module.exports = ($routeProvider) => {
  $routeProvider.otherwise({
    templateUrl: `./components/404/views/pages/404.html`,
    controller: `404_controller`
  })
}
