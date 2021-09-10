const {
  app,
  BrowserWindow,
  webContents,
  ipcMain,
  shell,
  globalShortcut
} = require('electron')

const fs = require('fs-extra')

const child_process = require('child_process')

const path = require('path')

const app_name = require('./package.json').name

const win_offset = 50 // the number of pixels to offset a new window by
const Config = require('./src/models/config')

var config = new Config()

const userData = app.getPath('userData')

config.load(userData, 'config')

ipcMain.on('print', (event, data) => {
  webContents.getFocusedWebContents().print({
    silent: false,
    printBackground: true,
    color: true,
    margin: {
      marginType: 'printableArea'
    },
    landscape: false,
    pagesPerSheet: 1,
    collate: false,
    copies: 1,
  })
})

// stop find in page handler
ipcMain.on('stopFindInPage', (event, data) => {
  webContents.getFocusedWebContents().stopFindInPage(data)
})

// find in page handler
ipcMain.on('findInPage', (event, data) => {
  webContents.getFocusedWebContents().findInPage(data.query, data.options)
})

// handle window maximize
ipcMain.on('maximize', (event, data) => {
  let win = BrowserWindow.getFocusedWindow()
  console.log(`maximizing window ${win.id}`)
  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
})

// handle window reload
ipcMain.on('reload', (event, data) => {
  BrowserWindow.getFocusedWindow().reload()
})

// handle window minimize
ipcMain.on('minimize', (event, data) => {
  BrowserWindow.getFocusedWindow().minimize()
})

// handle window close
ipcMain.on('close', (event, data) => {
  BrowserWindow.getFocusedWindow().close()
})

// Commands can be sent from the renderer to the main process
// errors and output are sent back in a reply
ipcMain.on('command', (event, command) => {
  console.log(`$ ${command}`)

  let data = {
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
    if (stdout) { console.log(`Child process STDOUT: ${stdout}`) }
    if (stderr) { console.log(`Child process STDERR: ${stderr}`) }
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
      // enableRemoteModule: true,
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

  // handle found in page event
  win.webContents.on('found-in-page', (event, result) => {
    win.webContents.send('found-in-page', result)
  })

  // ? The new window event triggers on shift+click or ctrl+click URLs and target="_blank" links
  win.webContents.setWindowOpenHandler((details) => {
    console.log(details)
    const { url } = details
    if (url.startsWith('http')) {
      shell.openExternal(url)
      return { action: 'deny' }
    } else {
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
      return { action: 'deny' }
    }
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
      win.webContents.send(`redirect`, url)
    } else if (config.last_url) {
      win.webContents.send(`redirect`, config.last_url)
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
  config.save(`${userData}`)
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