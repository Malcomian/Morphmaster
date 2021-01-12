var start = new Date().getMilliseconds()

const fs = require('fs-extra')
const walk = require('klaw-sync')
const path = require('path')

var project = require('../package.json')
console.log(`Building project, "${project.name}"...`)

const Command = require('commander').Command
const program = new Command()

const beautify = require('js-beautify').js

const appname = 'main' // the angular app name
const root = '_main' // the root component, which will be loaded first inside of prio_sort()
const controller_postfix = '_controller' // the extension string for controller files, ex: "_main_controller" or "about_controller"
const route_postfix = '_route' // the extension string for router files, ex: "_main_route"

var edited = 0
var copied = 0
var deleted = 0

class Scriptoid {
  /**
   * Scriptoid - a class for processing special comments in a javascript file
   * @param {String} filename name of the file
   * @param {String} source source folder path
   */
  constructor(filename, source) {
    this.filename = filename
    this.source = source
    this.contents = ''
    this.target = ''
    this.edit = false // boolean to check if this scriptoid instance has been edited
    this.remove_start = `// ! REMOVE ! //`
    this.remove_end = `// ! END-REMOVE ! //`
    this.reinsert_start = `// ! INSERT ! //`
    this.reinsert_end = `// ! END-INSERT ! //`
  }
  process(mode) {
    this.contents = fs.readFileSync(this.source).toString()
    let data = null
    switch (mode) {
      case 'on':
        data = this.uncomment(this.contents)
        data = this.uninsert(data)
        break;
      case 'off':
        data = this.comment(this.contents)
        data = this.reinsert(data)
        break;
      case 'build':
        data = this.comment(this.contents)
        data = this.reinsert(data)
        break;
      default:
        console.error(`couldn't process file mode`)
        return
        break;
    }
    this.save(data)
  }
  uncomment(source) {
    let contents = source.split('\n')
    let found = false
    for (let i = 0; i < contents.length; i++) {
      const element = contents[i];
      let whitespaces = this.slurp(element)
      let spacer = element.slice(0, whitespaces)
      if (element.startsWith(`${spacer}${this.remove_start}`)) {
        found = true
        continue
      }
      if (element.startsWith(`${spacer}${this.remove_end}`)) {
        found = false
        continue
      }
      if (found == true) {
        if (contents[i].startsWith(`${spacer}// `)) {
          this.edit = true
          contents[i] = contents[i].replace(`${spacer}// `, spacer)
        }
        continue
      }
    }
    contents = contents.join('\n')
    return contents
  }
  comment(source) {
    let contents = source.split('\n')
    let found = false
    for (let i = 0; i < contents.length; i++) {
      const element = contents[i];
      let whitespaces = this.slurp(element)
      let spacer = element.slice(0, whitespaces)
      if (element.startsWith(`${spacer}${this.remove_start}`)) {
        found = true
        continue
      }
      if (element.startsWith(`${spacer}${this.remove_end}`)) {
        found = false
        continue
      }
      if (found == true) {
        this.edit = true
        contents[i] = `// ${element}`
        continue
      }
    }
    contents = contents.join('\n')
    return contents
  }
  reinsert(source) {
    let contents = source.split('\n')
    let found = false
    for (let i = 0; i < contents.length; i++) {
      const element = contents[i];
      let whitespaces = this.slurp(element)
      let spacer = element.slice(0, whitespaces)
      if (element.startsWith(`${spacer}${this.reinsert_start}`)) {
        found = true
        continue
      }
      if (element.startsWith(`${spacer}${this.reinsert_end}`)) {
        found = false
        continue
      }
      if (found == true) {
        if (contents[i].startsWith(`${spacer}// `)) {
          this.edit = true
          contents[i] = contents[i].replace(`${spacer}// `, spacer)
        }
        continue
      }
    }
    contents = contents.join('\n')
    return contents
  }
  uninsert(source) {
    let contents = source.split('\n')
    let found = false
    for (let i = 0; i < contents.length; i++) {
      const element = contents[i];
      let whitespaces = this.slurp(element)
      let spacer = element.slice(0, whitespaces)
      if (element.startsWith(`${spacer}${this.reinsert_start}`)) {
        found = true
        continue
      }
      if (element.startsWith(`${spacer}${this.reinsert_end}`)) {
        found = false
        continue
      }
      if (found == true) {
        this.edit = true
        contents[i] = `// ${element}`
        continue
      }
    }
    contents = contents.join('\n')
    return contents
  }
  /**
   * Slurp - returns the number of whitespace characters at the start of the string
   * @param {string} line a string to be analyzed
   */
  slurp(line) {
    let whitespaces = line.split(/[^ \t\r\n]/)[0].length
    return whitespaces
  }
  save(data) {
    if (!fs.existsSync(this.target)) {
      // always copy if the file doesn't exist
      fs.outputFileSync(this.target, data)
      edited++
      return
    } else {
      if (this.edit) {
        // only copy edited files if they will actually be different
        if (fs.readFileSync(this.target).toString() == data) return
        fs.outputFileSync(this.target, data)
        edited++
        return
      } else {
        // only copy newer files if no edits were made
        if (fs.lstatSync(this.target).mtimeMs < fs.lstatSync(this.source).mtimeMs) {
          fs.outputFileSync(this.target, data)
          edited++
          return
        }
      }
    }
  }
}

program.name('evoke')
program.version('0.0.1')

program
  .command('on <target>')
  .description('turn special comments in target directory on')
  .action((target) => on(target))

program
  .command('off <target>')
  .description('turn special comments in target directory off')
  .action((target) => off(target))

program
  .command('toggle <target>')
  .description('toggle special comments in target directory')
  .action((target) => toggle(target))

program
  .command('build <source> <target>')
  .description('build special comments from source directory to target directory')
  .action((source, target) => build(source, target))

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
 * On - turns special comment sections "on" in target directory
 * @param {String} target directory path
 */
function on(target) {
  // console.log(`called on: ${target}`)
  const files = get_files(target)
  transpile({
    mode: 'on',
    target: target,
    files: files
  })
}

/**
 * Off - turns special comment sections "off" in target directory
 * @param {String} target directory path
 */
function off(target) {
  // console.log(`called off: ${target}`)
  const files = get_files(target)
  transpile({
    mode: 'off',
    target: target,
    files: files
  })
}

/**
 * Toggle - toggles special comment sections in target directory
 * @param {String} target target directory
 */
function toggle(target) {
  // console.log(`called toggle: ${target}`)
  let state = project.toggle
  if (state == 'on') {
    off(target)
    project.toggle = 'off'
  } else if (state == 'off') {
    on(target)
    project.toggle = 'on'
  }
  var result = beautify(JSON.stringify(project), {
    indent_size: 2
  })
  let dirname = __dirname
  dirname = dirname.split('\\')
  dirname.pop()
  dirname = dirname.join('\\')
  fs.writeFileSync(`${dirname}\\package.json`, result)
  console.log(`Successfully toggled package ${project.toggle}`)
}

/**
 * Build - toggles the source folder comments and copies any new files to the target build folder
 * @param {String} source source folder path
 * @param {String} target target folder path
 */
function build(source, target) {
  remap()
  console.log(`Called build: ${source} => ${target}`)
  const files = get_files(source)
  transpile({
    mode: 'build',
    source: source,
    target: target,
    files: files
  })
}

/**
 * Get Files - walks through the given directory and returns all dirents
 * @param {String} target target directory
 */
function get_files(target) {
  const files = walk(target, {
    nodir: true
  })
  console.log(`Analyzing ${files.length} files...`)
  return files
}

/**
 * Get Files List
 * @param {String} target target folder to scan
 * - gets list of files in folder without extensions
 */
function get_files_list(target) {
  let files = fs.readdirSync(target, {
    withFileTypes: true
  })
  files = files.filter(dirent => dirent.isFile()).map(dirent => dirent.name)
  // remove filename extension
  files = files.map((file) => {
    file = file.split('.')
    file.pop()
    file = file.join('.')
    return file
  })
  return files
}

/**
 * Transpile - transpiles and comments/uncomments a file structure based on the given mode
 * @param {Object} options an object with keys "mode", "target", "source", "files" depending on mode
 */
function transpile(options) {
  // create target directory if in build mode
  if (options.mode == 'build') {
    var target_directory = path.resolve(options.target)
    var source_directory = path.resolve(options.source)
    fs.ensureDirSync(target_directory)
  }

  for (let i = 0; i < options.files.length; i++) {
    const element = options.files[i];
    if (element.path.endsWith('.js')) {
      let source = element.path
      let filename = ''
      filename = source.split('\\')
      filename = filename[filename.length - 1]
      let javascript = new Scriptoid(filename, source)
      if (options.mode == 'build') {
        let destination = `${source}`
        destination = destination.replace(source_directory, target_directory)
        javascript.target = destination
      } else {
        javascript.target = source
      }
      javascript.process(options.mode)
    } else if (options.mode == 'build') {
      // copy file directly...
      let source = element.path
      let destination = `${source}`
      destination = destination.replace(source_directory, target_directory)
      let source_folder = `${source}`
      source_folder = source_folder.split(`\\`)
      source_folder.pop()
      source_folder = source_folder.join(`\\`)
      let destination_folder = `${source_folder}`
      destination_folder = destination_folder.replace(source_directory, target_directory)
      // console.log(`ensuring ${destination_folder}`)
      // console.log(`copying ${source} => ${destination}`)
      fs.ensureDirSync(destination_folder)
      // only copy newer files
      if (fs.existsSync(destination)) {
        let current = fs.statSync(source).mtimeMs
        let replace = fs.statSync(destination).mtimeMs
        if (current != replace) {
          fs.copyFileSync(source, destination)
          copied++
        }
      } else {
        fs.copyFileSync(source, destination)
        copied++
      }
      // end loop
    }
  }
  console.log(`Edited ${edited} javascript files`)
  console.log(`Copied ${copied} other files`)
  if (options.mode == 'build') cleanup(source_directory, target_directory)
  end()
}

/**
 * Cleanup - removes any files or folders in the target folder structure that don't match the source
 * @param {String} source source folder path
 * @param {String} target target folder path
 */
function cleanup(source, target) {
  let structure = walk(target)
  let project_source = path.resolve('.')
  for (let i = 0; i < structure.length; i++) {
    let unlink = structure[i].path;
    let test = unlink.replace(target, source)
    if (!fs.existsSync(test) && fs.existsSync(unlink)) {
      let stats = false
      try {
        stats = fs.lstatSync(unlink)
      } catch {
        console.log(`error getting stats for ${unlink.replace(project_source, '')}`)
      }
      if (stats == false) continue
      if (stats.isFile()) {
        console.log(`...deleting file ${unlink.replace(project_source, '')}...`)
        fs.unlinkSync(unlink)
      }
      if (stats.isDirectory()) {
        console.log(`...deleting folder ${unlink.replace(project_source, '')}...`)
        fs.removeSync(unlink)
      }
      deleted++
    }
  }
  console.log(`Deleted ${deleted} items`)
}

/**
 * End - measure and print final elapsed time
 */
function end() {
  var end = new Date().getMilliseconds()
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

  let target = `${path.resolve('./src/components')}\\${name}`
  if (fs.existsSync(target)) {
    console.log(`folder already exists`)
    return
  }
  // create folder structure
  fs.outputFileSync(`${target}\\controllers\\${name}${controller_postfix}.js`, require('./lib/controller')())
  fs.outputFileSync(`${target}\\routes\\${name}${route_postfix}.js`, require('./lib/route')(name, url, `${name}${controller_postfix}`, name))
  fs.outputFileSync(`${target}\\views\\pages\\${name}.html`, require('./lib/html')(name))
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
  folder = folder.split('/').join('\\') // replace all slashes with backslashes for folder path
  let target = `${path.resolve('./src/components')}\\${component}`
  switch (folder) {
    case 'controllers':
      fs.outputFileSync(`${target}\\${folder}\\${filename}`, require('./lib/controller')())
      break;
    case 'routes':
      fs.outputFileSync(`${target}\\${folder}\\${filename}`, require('./lib/route')(component, url, controller, template))
      break;
    case 'services':
      fs.outputFileSync(`${target}\\${folder}\\${filename}`, require('./lib/service')())
      break;
    case 'filters':
      fs.outputFileSync(`${target}\\${folder}\\${filename}`, require('./lib/filter')())
      break;
    case 'directives':
      fs.outputFileSync(`${target}\\${folder}\\${filename}`, require('./lib/directive')(filename))
      break;
    default:
      fs.outputFileSync(`${target}\\${folder}\\${filename}`, '')
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
  if (JSON.stringify(app) == JSON.stringify(result)) return // only write if the new file would be different

  console.log(`Remapping ${components.length} project components...`)

  // console.log(result)
  fs.writeFileSync(`${path.resolve('./src/models')}\\.app.json`, beautify(JSON.stringify(result), {
    indent_size: 2
  }))
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