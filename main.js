const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  globalShortcut
} = require('electron')

const fs = require('fs-extra')

const child_process = require('child_process')

const path = require('path')

app.allowRendererProcessReuse = true

const app_name = require('./package.json').name

const win_offset = 50 // the number of pixels to offset a new window by
const Config = require('./src/models/config')

var config = new Config()

const AppData = app.getPath('userData')

config.load(AppData, 'config')

// Commands can be sent from the renderer to the main process
// errors and output are sent back in a reply
ipcMain.on('command', (event, command) => {
  console.log(`$ ${command}`)

  var data = {
    error: false,
    stdout: false,
    stderr: false
  }

  child_process.exec(`${command}`, (error, stdout, stderr) => {
    if (error) {
      console.log(error.stack)
      console.log(`Error code: ${error.code}`)
      console.log(`Signal received: ${error.signal}`)
      data.error = error
    }
    console.log(`Child process STDOUT: ${stdout}`)
    console.log(`Child process STDERR: ${stderr}`)
    data.stdout = stdout
    data.stderr = stderr
    event.reply('run-output', data)
  })

})

function create_window(options) {
  console.log(`creating new window...`)
  // console.log(options)
  let win = new BrowserWindow({
    show: false,
    backgroundColor: '#ffffff',
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    minWidth: options.min_width,
    minHeight: options.min_height,
    icon: path.join(__dirname, 'resources/icon.ico'),
    frame: false,
    // resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // devTools: false
    }
  })

  win.loadFile(path.join(__dirname, './build/index.html'))

  if (config.maximized) win.maximize()

  win.on('maximize', (event) => {
    config.maximized = true
  })

  win.on('unmaximize', (event) => {
    config.maximized = false
  })

  // ? The new window event triggers on shift+click or ctrl+click URLs and target="_blank" links
  win.webContents.on('new-window', (event, ...args) => {
    let url = args[0];
    if (url.startsWith('http')) {
      shell.openExternal(url)
    } else {
      // create a new window based on the current bounds and given URL
      let bounds = win.getBounds();
      create_window({
        url: url,
        x: bounds.x + win_offset,
        y: bounds.y + win_offset,
        width: bounds.width,
        height: bounds.height,
        min_width: config.min_width,
        min_height: config.min_height,
      })
    }
    event.preventDefault();
  })

  // show the page only once it's ready
  win.once('ready-to-show', () => {
    // win.setMenu(null); // resets the menu
    // ? if a url was given, send the redirect url to the target window
    // ! this redirect ipc event needs to be placed here, otherwise the browser window will not have loaded yet!
    if (options.url) {
      let url = options.url
      url = url.split('index.html').pop()
      console.log(`redirecting window ${win.id} to ${url}`)
      win.webContents.send(`redirect-${win.id}`, url)
    } else if (config.last_url) {
      win.webContents.send(`redirect-${win.id}`, config.last_url)
    }
    win.show()
  })

  win.on('close', () => {
    if (!config.fullscreen) {
      // console.log('window is not fullscreen')
      let bounds = win.getBounds();
      config.x = bounds.x;
      config.y = bounds.y;
      config.width = bounds.width;
      config.height = bounds.height;
      let last_url = win.webContents.getURL()
      last_url = last_url.split('index.html').pop()
      console.log(`saving last url: ${last_url}`)
      config.last_url = last_url
    }
  })
}

// run create window function after 10 milliseconds
app.on('ready', function () {
  setTimeout(function () {
    create_window(config);
  }, 10);
});

app.on('will-quit', () => {
  config.save(`${AppData}`)
})

// quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  // darwin for mac, win32 for windows or something
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    create_window(config)
  }
})