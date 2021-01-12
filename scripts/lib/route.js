module.exports = (name, controller_postfix, url, controller, template) => {
  return `module.exports = ($routeProvider) => {
  $routeProvider.when(\`${url}\`, {
    templateUrl: \`./components/${name}/views/pages/${template}.html\`,
    controller: \`${controller}${controller_postfix}\`
  })
}
`
}