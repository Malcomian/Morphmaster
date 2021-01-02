const angular = require('angular')

class Server {
  constructor() {
    this.app = require('./.app.json')
    this.load()
  }
  load() {
    /**
     * * Base App
     */
    angular.module(this.app.appname, [require('angular-route'), require('angular-sanitize'), require('angular-animate'), require('angular-touch'), require('angular-vs-repeat')])
    /**
     * * Components
     */
    console.log(`loading ${this.app.components.length} components...`)
    this.app.components.forEach(component => {
      console.log(`loading ${component.name}...`)
      if (component.controllers) this.register_controllers(component)
      if (component.routes) this.register_routes(component)
      if (component.filters) this.register_filters(component)
      if (component.services) this.register_services(component)
      if (component.directives) this.register_directives(component)
    })
  }
  register_controllers(component) {
    component.controllers.forEach((controller) => {
      console.log(`registering controller "${controller}"`)
      angular.module(this.app.appname).controller(`${controller}`, require(`../components/${component.name}/controllers/${controller}`))
    })
  }
  register_routes(component) {
    component.routes.forEach((route) => {
      console.log(`registering route "${route}"`)
      angular.module(this.app.appname).config(require(`../components/${component.name}/routes/${route}`))
    })
  }
  register_filters(component) {
    component.filters.forEach((filter) => {
      console.log(`registering filter "${filter}"`)
      angular.module(this.app.appname).filter(filter, require(`../components/${component.name}/filters/${filter}`))
    })
  }
  register_services(component) {
    component.services.forEach((service) => {
      console.log(`registering service "${service}"`)
      angular.module(this.app.appname).factory(service, require(`../components/${component.name}/services/${service}`))
    })
  }
  register_directives(component) {
    component.directives.forEach((directive) => {
      console.log(`registering directive "${directive}"`)
      angular.module(this.app.appname).directive(directive, require(`../components/${component.name}/directives/${directive}`))
    })
  }
}

module.exports = Server