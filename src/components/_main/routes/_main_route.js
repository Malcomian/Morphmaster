module.exports = ($routeProvider) => {
  $routeProvider.when(`/`, {
    templateUrl: `./components/_main/views/pages/_main.html`,
    // controller: `_main_controller` // the main controller is already bootstrapped to the main html element in index.html
  })
}
