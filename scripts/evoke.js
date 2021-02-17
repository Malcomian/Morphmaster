var start = new Date().getMilliseconds()

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

var edited = 0
var copied = 0

class Node {
  /**
   * Node - an object for storing information about a file or folder
   * @param {string} name name of the file or folder
   * @param {string} path full path to the file or folder
   * @param {('file'|'folder')} type either file or folder
   * @returns {object} a node object containing the name, path, and type of node
   */
  constructor(name, path, type) {
    this.name = name
    this.path = path
    this.type = type
  }
  /**
   * Returns true if the node is a directory. Alias of isFolder()
   */
  isDirectory() {
    return (this.type == 'folder' ? true : false)
  }
  /**
   * Returns true if the node is a folder. Alias of isDirectory()
   */
  isFolder() {
    return (this.type == 'folder' ? true : false)
  }
  /**
   * Returns true if the node is a file
   */
  isFile() {
    return (this.type == 'file' ? true : false)
  }
}

class Scriptoid {
  /**
   * Scriptoid - inserts and removes comments based on specific patterns
   * @param {string} source full path to source file
   * @param {string} target full path to target file
   */
  constructor(source, target) {
    this.source = source
    this.target = target
    this.contents = ''
    this.was_edited = false
    this.inline_insert_regex = /(?<=\/\*\+\*\/)(.*?)(?=\/\*\.\*\/)/g
    this.inline_remove_regex = /(?<=\/\*\-\*\/)(.*?)(?=\/\*\.\*\/)/g
    this.inline_insert_string = `/*+*/`
    this.inline_remove_string = `/*-*/`
    this.inline_ending_string = `/*.*/`
    this.line_insert = `// /*++*/`
    this.line_remove = `/*--*/`
    this.multiline_insert = `/*+++*/`
    this.multiline_remove = `/*---*/`
    this.multiline_ending = `/*...*/`
  }
  /**
   * Evokes the file and saves it
   */
  evoke() {
    this.contents = fs.readFileSync(this.source).toString()
    let data = this.process(this.contents)
    // console.log(`Finished evoking file "${this.get_filename(this.source)}"!`)
    return this.save(data)
  }
  save(data) {
    if (!fs.existsSync(this.target)) {
      fs.outputFileSync(this.target, data)
      edited++
      return true
    } else {
      if (this.was_edited) {
        if (fs.readFileSync(this.target).toString() == data) return true
        fs.outputFileSync(this.target, data)
        edited++
        return true
      } else {
        return false
      }
    }
  }
  process(contents) {
    let file = []
    file = contents.split('\n') // split at every newline
    var inserting = false
    var removing = false
    for (let i = 0; i < file.length; i++) {
      const line = file[i];
      let spaces = this.leading(line)
      let sentence = line.slice(spaces.length, line.length)
      // end multiline
      if (sentence.startsWith(this.multiline_ending)) {
        inserting = false
        removing = false
      }
      // handle multiline
      if (inserting) {
        this.was_edited = true
        sentence = sentence.replace('// ', '')
      }
      if (removing) {
        this.was_edited = true
        sentence = `// ${sentence}`
      }
      // establish multiline state
      if (sentence.startsWith(this.multiline_insert)) {
        inserting = true
      }
      if (sentence.startsWith(this.multiline_remove)) {
        removing = true
      }
      // handle single lines
      if (sentence.startsWith(this.line_insert)) {
        this.was_edited = true
        sentence = sentence.replace('// ', '')
      }
      if (sentence.startsWith(this.line_remove)) {
        this.was_edited = true
        sentence = `// ${sentence}`
      }
      // inline insertion
      if (this.inline_insert_regex.test(sentence)) {
        var temp = sentence.split(this.inline_insert_regex)
        for (let x = 0; x < temp.length; x++) {
          const part = temp[x];
          if (part.endsWith(this.inline_insert_string)) {
            this.was_edited = true
            temp[x + 1] = temp[x + 1].replace(' /*', '')
            continue
          }
        }
        sentence = temp.join('')
      }
      // inline removal
      if (this.inline_remove_regex.test(sentence)) {
        var temp = sentence.split(this.inline_remove_regex)
        for (let x = 0; x < temp.length; x++) {
          const part = temp[x];
          if (part.endsWith(this.inline_remove_string)) {
            this.was_edited = true
            temp[x + 1] = ` /*${temp[x + 1]}`
            continue
          }
        }
        sentence = temp.join('')
      }
      // reconstruct the line and replace it in the file
      file[i] = `${spaces}${sentence}`
    }
    file = file.join('\n') // join file with newlines
    return file
  }
  /**
   * Leading - get the leading whitespace characters from a string
   * @param {String} line Any string or line of code
   */
  leading(line) {
    return line.split(/[^ \s]/)[0]
  }
  /**
   * Get Filename - get the filename from a given full file path
   * @param {String} source Full path to file
   */
  get_filename(source) {
    return source.split('\\').pop()
  }
}

program.name('evoke')
program.version('0.0.1')

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
 * Build - evokes the source folder js files and copies any new files to target build folder
 * @param {string} source relative source folder path
 * @param {string} target relative target folder path
 */
function build(source, target) {
  console.log(`Called build: ${source} => ${target}`)

  const source_directory = path.resolve(source)
  const target_directory = path.resolve(target)

  fs.ensureDirSync(target_directory) // ensure root build folder path

  const nodes = get_nodes(source_directory)

  nodes.forEach((node) => {
    let destination = node.path.replace(source_directory, target_directory)
    if (node.isFile()) {
      if (node.name.endsWith('.js')) {
        let js = new Scriptoid(node.path, destination)
        // evoke will handle saving the file if it was edited and is different than the target
        if (!js.evoke()) {
          copy_if_newer_or_nonexistant(node.path, destination)
        }
      } else {
        copy_if_newer_or_nonexistant(node.path, destination)
      }
    } else if (node.isFolder()) {
      fs.ensureDirSync(destination)
    }
  })
  console.log(`Edited ${edited} javascript files`)
  console.log(`Copied ${copied} other files`)
  cleanup(source_directory, target_directory)
  end()
}

/**
 * Cleanup - removes any files or folders in the target folder structure that don't match the source
 * @param {String} source full source folder path
 * @param {String} target full target folder path
 */
function cleanup(source, target) {
  var deleted = 0
  const nodes = get_nodes(target)
  let project_source = path.resolve('.')
  nodes.forEach((node) => {
    let unlink = node.path
    let test = unlink.replace(target, source)
    if (!fs.existsSync(test)) {
      if (node.isFile()) {
        console.log(`...deleting file ${unlink.replace(project_source, '')}`)
        fs.unlinkSync(unlink)
        deleted++
      }
      if (node.isDirectory()) {
        console.log(`...deleting folder ${unlink.replace(project_source, '')}`)
        fs.removeSync(unlink)
        deleted++
      }
    }
  })
  console.log(`Deleted ${deleted} items`)
}

/**
 * copies source file to target if it's newer or nonexistant
 * @param {string} source full path to source file
 * @param {string} target full path to target file
 */
function copy_if_newer_or_nonexistant(source, target) {
  if (fs.existsSync(target)) {
    let current = fs.statSync(source).mtimeMs
    let replace = fs.statSync(target).mtimeMs
    if (current != replace) {
      fs.copyFileSync(source, target)
      copied++
    }
  } else {
    fs.copyFileSync(source, target)
    copied++
  }
}

/**
 * Get Nodes - recursively gets all files and folders in given directory and all subdirectories
 * @param {string} dir full path of directory to scan
 * @returns {[Node]} Array of node objects
 */
function get_nodes(dir) {
  var nodes = []
  let dirents = fs.readdirSync(dir, {
    withFileTypes: true
  })
  dirents.forEach((dirent) => {
    if (dirent.isDirectory()) {
      // handle folder
      nodes.push(new Node(dirent.name, `${dir}\\${dirent.name}`, 'folder'))
      nodes = nodes.concat(get_nodes(`${dir}\\${dirent.name}`))
    } else if (dirent.isFile()) {
      // handle file
      nodes.push(new Node(dirent.name, `${dir}\\${dirent.name}`, 'file'))
    }
  })
  return nodes
}

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
    file = file.split('.')
    file.pop()
    file = file.join('.')
    return file
  })
  return files
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

  // ! the relative path to the components folder is unfortunately hard coded here...
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
  fs.writeFileSync(`${path.resolve('./src/models')}\\.app.json`, JSON.stringify(result, null, 2))
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