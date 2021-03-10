/*---*/
console.log(`Remove this at build!`)
const {
  electron,
  fs,
  $,
  Popper,
  Bootstrap,
  server,
  _,
} = require('../../../index')
/*...*/

module.exports = function ($scope, $rootScope) {
  /*+++*/
  // var vm = $scope // set vm equal to $scope when in production
  // var root = $rootScope // set root equal to $rootScope in production
  /*...*/
  /*---*/
  var vm = {} // initialize scope object as a basic object in development
  var root = {} // initialize root scope object as a basic object in development
  /*...*/

  // scrolling the main div hides the right click context menu
  document.getElementById('main').onscroll = () => {
    $('#context').addClass('d-none')
  }

  // when the right click context menu is blurred, hide it
  document.getElementById('open-in-new').addEventListener('blur', () => {
    $('#context').addClass('d-none')
  })

  root.set_context = set_context
  root.display_context = display_context

  root.location = get_location()
  root.get_location = get_location
  root.navigate = navigate

  electron.ipcRenderer.on(`redirect-${electron.remote.getCurrentWebContents().id}`, (event, data) => {
    // console.log('got redirect data')
    // ? redirect to the given url, but use the replace method to replace the first history state
    window.location.replace(data)
  })

  var project = require('../../../../package.json')
  console.log(`project info:`)
  console.log(project)
  root.project = project

  root.$on('$locationChangeStart', (event) => {
    console.log('changing location...')
  })

  root.$on('$locationChangeSuccess', (event) => {
    setTimeout(() => {
      root.set_context() // set right click context menu for each page! ... still can't tell why it must be delayed, though!
    }, 200)
    root.location = get_location()
    $('#form-location input').val(get_location())
  })

  // example of sending and receiving custom commands and outputs to/from the main process
  electron.ipcRenderer.on('run-output', (event, data) => {
    if (data.error) console.error(data.error)
    if (data.stdout) console.log(data.stdout)
    if (data.stderr) console.log(data.stderr)
  })
  electron.ipcRenderer.send('command', 'echo Hello, world!')

  vm.back = back
  vm.forward = forward
  vm.refresh = refresh
  vm.select_location = select_location

  vm.minimize = minimize
  vm.maximize = maximize
  vm.close = close

  root.md = require('../../../models/md')

  root.finder = require('../../../models/finder').init()

  function back() {
    window.history.back()
  }

  function forward() {
    window.history.forward()
  }

  function refresh() {
    electron.remote.getCurrentWebContents().reload()
  }

  function select_location() {
    document.getElementById('location').select()
  }

  function navigate() {
    console.log(`navigating to ${root.location}`)
    let href = $('#form-location input').val()
    href = encodeURI(href)
    href = `#!/${href}`
    window.location.href = href
  }

  function get_location() {
    let hash = window.location.hash
    hash = hash.replace('#!/', '')
    return decodeURI(hash)
  }

  function minimize() {
    electron.remote.getCurrentWindow().minimize()
  }

  function maximize() {
    if (electron.remote.getCurrentWindow().isMaximized()) {
      electron.remote.getCurrentWindow().unmaximize()
    } else {
      electron.remote.getCurrentWindow().maximize()
    }
  }

  function close() {
    electron.remote.getCurrentWindow().close()
  }

  /**
   * sets context menu events for all links on the page that don't have it set yet
   */
  function set_context() {
    let links = document.querySelectorAll('a:not([hascontext])')
    links.forEach(link => {
      link.setAttribute('hascontext', '')
      link.addEventListener('contextmenu', (event) => {
        root.display_context(event.x, event.y, link.getAttribute('href'))
      })
    })
  }

  /**
   * displays right click context menu at x, y position
   * @param {number} x x position to display context menu
   * @param {number} y y position to display context menu
   * @param {string} href url to navigate to when "open in new" is clicked
   */
  function display_context(x, y, href) {
    $('#context').removeClass('d-none').css({ left: x, top: y })
    let el = document.getElementById('open-in-new')
    el.focus()
    $('#open-in-new').attr('href', href)
    $('#open-in-new').on('click', () => {
      console.log(`opening ${href} in new app window...`)
      $(this).addClass('d-none')
    })
  }

  /*---*/
  module.exports = root // rewrite the module exports to be the root scope object
  /*...*/

}