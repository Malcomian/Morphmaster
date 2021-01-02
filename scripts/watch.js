var chokidar = require('chokidar')
const child_process = require('child_process')

var arg = process.argv.slice(2)[0]
var source = require('path').resolve(arg)

var watcher = chokidar.watch(source, {
  ignored: /(^|[\/\\])\../,
  persistent: true
})

console.log(`Starting watcher...`)

var started = false
var start = 3000 // delay after initialization before enabling logging - otherwise the script will log every file and directory when they're first added to the watcher
var wait = false // will be changed to a setTimeout instance once defer is called
var countdown = 1000 // wait cooldown

setTimeout(() => {
  started = true
  console.log(`Watching ${source}...`)
}, start)

watcher.on('add', (path) => {
  path = path.replace(`${source}\\`, '')
  if (started) console.log(`File ${path} has been added!`)
  defer()
})

watcher.on('addDir', (path) => {
  path = path.replace(`${source}\\`, '')
  if (started) console.log(`Directory ${path} has been added!`)
  defer()
})

watcher.on('change', (path) => {
  path = path.replace(`${source}\\`, '')
  if (started) console.log(`File ${path} has been changed!`)
  defer()
})

watcher.on('unlink', (path) => {
  path = path.replace(`${source}\\`, '')
  if (started) console.log(`File ${path} has been removed!`)
  defer()
})

watcher.on('unlinkDir', (path) => {
  path = path.replace(`${source}\\`, '')
  if (started) console.log(`Directory ${path} has been removed!`)
  defer()
})

function defer() {
  if (wait) {
    wait.refresh()
  } else {
    wait = setTimeout(() => {
      rebuild()
    }, countdown)
  }
}

function rebuild() {
  child_process.exec(`npm run build`, (error, stdout, stderr) => {
    if (error) {
      console.log(error.stack)
    }
    if (stdout) {
      console.log(stdout)
    }
  })
}