module.exports = ($routeProvider) => {
  $routeProvider.when(`/about`, {
    templateUrl: `./components/about/views/pages/about.html`,
    controller: `about_controller`
  })
}
