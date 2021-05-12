var start = Date.now()

const fs = require('fs-extra')
const path = require('path')

var project = require('../package.json')
console.log(`Building project, "${project.name}"...`)

const Command = require('commander').Command
const program = new Command()

const appname = 'main' // the angular app name
const root = '_main' // the root component, which will be loaded first inside of prio_sort()
const controller_postfix = '_controller' // the extension string for controller files, ex: "_main_controller" or "about_controller"
const route_postfix = '_route' // the extension string for router files, ex: "_main_route"

program.name('evoke')
program.version('0.0.1')

program
  .command('gen <name> <url>')
  .description('create a new component - git bash must escape slashes with two slashes // or else it returns the folder path to Git')
  .action((name, url) => generate(name, url))

program
  .command('add <component> <folder> <filename> [url] [controller] [template]')
  .description('adds new file to target component folder structure given the type of directory. Ex: $ add "_main" routes home_route.js //home home_controller home')
  .action((component, folder, filename, url, controller, template) => add(component, folder, filename, url, controller, template))

program
  .command('remap')
  .action(() => remap())
  .description('remaps the current set of components to app.json')

program.parse(process.argv)

/**
 * Get Files List - gets list of files in folder without extensions
 * @param {String} target target folder to scan
 */
function get_files_list(target) {
  let files = fs.readdirSync(target, {
    withFileTypes: true
  })
  files = files.filter(dirent => dirent.isFile()).map(dirent => dirent.name)
  // remove filename extension
  files = files.map((file) => {
    return path.parse(file).name
  })
  return files
}

/**
 * End - measure and print final elapsed time
 */
function end() {
  var end = Date.now()
  var elapsed = end - start
  console.log(`Finished in ${elapsed}ms!`)
}

/**
 * Generate - generates a component with given name and url
 * @param {String} name component name
 * @param {String} url default route url
 */
function generate(name, url) {
  console.log(`generating component ${name} at "${url}"...`)

  // ! the relative path to the components folder is unfortunately hard coded here...
  let target = path.resolve(`${path.resolve('./src/components')}/${name}`)
  if (fs.existsSync(target)) {
    console.log(`folder already exists`)
    return
  }
  // create folder structure
  fs.outputFileSync(path.resolve(`${target}/controllers/${name}${controller_postfix}.js`), require('./lib/controller')())
  fs.outputFileSync(path.resolve(`${target}/routes/${name}${route_postfix}.js`), require('./lib/route')(name, url, `${name}${controller_postfix}`, name))
  fs.outputFileSync(path.resolve(`${target}/views/pages/${name}.html`), require('./lib/html')(name))
  // remap() // disabled because of watcher
}

/**
 * Add - adds a new file to the given component
 * @param {String} component name of the component
 * @param {String} dir subdirectory within the component folder - "controllers", "services", etc
 * @param {String} filename name of the file
 * @param {String} url optional URL string for defining route files
 */
function add(component, folder, filename, url, controller, template) {
  folder = folder.split('/').join(path.sep) // replace all slashes with path separator
  let target = path.resolve(`./src/components/${component}`)
  switch (folder) {
    case 'controllers':
      fs.outputFileSync(path.resolve(`${target}/${folder}/${filename}`), require('./lib/controller')())
      break;
    case 'routes':
      fs.outputFileSync(path.resolve(`${target}/${folder}/${filename}`), require('./lib/route')(component, url, controller, template))
      break;
    case 'services':
      fs.outputFileSync(path.resolve(`${target}/${folder}/${filename}`), require('./lib/service')())
      break;
    case 'filters':
      fs.outputFileSync(path.resolve(`${target}/${folder}/${filename}`), require('./lib/filter')())
      break;
    case 'directives':
      fs.outputFileSync(path.resolve(`${target}/${folder}/${filename}`), require('./lib/directive')(filename))
      break;
    default:
      fs.outputFileSync(path.resolve(`${target}/${folder}/${filename}`), '')
      break;
  }
  // remap() // disabled because of watcher
}

/**
 * Remap
 * scans the current folder structure and writes out app.json within the models folder
 */
function remap() {
  let components = get_folders(path.resolve('./src/components'))

  components = prio_sort(components)
  components = components.map((element) => rescan(element))

  var result = {}
  result.appname = appname
  result.root = root
  result.controller_postfix = controller_postfix
  result.route_postfix = route_postfix
  result.components = components

  let app = require('../src/models/.app.json')
  if (JSON.stringify(app) == JSON.stringify(result)) {
    console.log(`No remap needed!`)
    end()
    return // only write if the new file would be different
  }

  console.log(`Remapping ${components.length} project components...`)

  // console.log(result)
  fs.writeFileSync(path.resolve(`./src/models/.app.json`), JSON.stringify(result, null, 2))
  end()
}

/**
 * Rescan - rescans an individual component folder and returns the folder structure as an object
 * @param {String} component component name
 */
function rescan(component) {
  var result = {}
  result.name = component
  // get folders within component structure
  let folders = get_folders(path.resolve(`./src/components/${component}`))
  // register controllers, routes, filters, services, directives
  // result.url = require(`../src/components/${component}/index`).url // ! no need for URLs to be in app.json file - just folder structure
  if (folders.includes('controllers')) result.controllers = get_files_list(path.resolve(`./src/components/${component}/controllers`))
  if (folders.includes('routes')) result.routes = get_files_list(path.resolve(`./src/components/${component}/routes`))
  if (folders.includes('filters')) result.filters = get_files_list(path.resolve(`./src/components/${component}/filters`))
  if (folders.includes('services')) result.services = get_files_list(path.resolve(`./src/components/${component}/services`))
  if (folders.includes('directives')) result.directives = get_files_list(path.resolve(`./src/components/${component}/directives`))
  // console.log(result)
  return result
}

/**
 * Prio Sort - sorts an array and unshifts the root component to the start of the array
 * @param {Array} components array of component names
 */
function prio_sort(components) {
  components.sort()
  for (let i = 0; i < components.length; i++) {
    const element = components[i];
    if (element == root) {
      components.splice(i, 1)
      components.unshift(root)
    }
  }
  return components
}

/**
 * Get Folders - returns a list of directory folder names
 * @param {String} folder directory path
 */
function get_folders(folder) {
  let folders = fs.readdirSync(folder, {
    withFileTypes: true
  })
  folders = folders.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
  return folders
}