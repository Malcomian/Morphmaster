module.exports = (name, controller_postfix, url) => {
  return `module.exports = ($routeProvider) => {
  $routeProvider.when(\`${url}\`, {
    templateUrl: \`./components/${name}/views/pages/${name}.html\`,
    controller: \`${name}${controller_postfix}\`
  })
}
`
}