/*---*/
console.log(`Remove this at build!`)
const { $, _, ace, bootstrap, electron, finder, fs, server } = require('../../../index')
/*...*/

module.exports = function ($scope, $rootScope) {
  /*+++*/
  // var vm = $scope // set vm equal to $scope when in production
  // var root = $rootScope // set root equal to $rootScope in production
  /*...*/
  /*---*/
  var vm = {} // initialize scope object as a basic object in development
  var root = {} // initialize root scope object as a basic object in development
  // Full AngularJS rootScope reference
  root.$new = $new
  root.$watch = $watch
  root.$watchGroup = $watchGroup
  root.$watchCollection = $watchCollection
  root.$digest = $digest
  root.$suspend = $suspend
  root.$isSuspended = $isSuspended
  root.$resume = $resume
  root.$destroy = $destroy
  root.$eval = $eval
  root.$evalAsync = $evalAsync
  root.$apply = $apply
  root.$applyAsync = $applyAsync
  root.$on = $on
  root.$emit = $emit
  root.$broadcast = $broadcast
  /*...*/

  // scrolling the main div hides the right click context menu
  document.getElementById('main').onscroll = () => {
    $('#context').addClass('d-none')
  }

  // when the right click context menu is blurred, hide it
  document.getElementById('open-in-new').addEventListener('blur', () => {
    $('#context').addClass('d-none')
  })

  root.progress = require('nprogress/nprogress')
  root.progress.configure({
    showSpinner: false,
    parent: '#progress-bar'
  })

  root.display_context = display_context

  // terminal commands
  root.cmd = {
    input: '',
    lead: '',
    select: () => {
      document.getElementById('terminal-input').focus()
      document.getElementById('terminal-input').select()
    },
    parse: () => {
      console.log('parsing command...')
      console.log($('#terminal-input').val())
      $('#terminal-input').val('')
      $('#terminal-input-lead').val('')
    },
    interpret: () => {
      console.log('interpreting command...')
      let command = $('#terminal-input').val()
      if ((command) == 'hi') {
        root.cmd.lead = '  !!!'
      } else {
        root.cmd.lead = ''
      }
    },
    tab_complete: () => {
      console.log('tab completion!')
      let command = $('#terminal-input').val()
      let lead = $('#terminal-input-lead').val()
      lead = lead.trim()
      $('#terminal-input').val(`${command}${lead}`)
      $('#terminal-input-lead').val('')
    }
  }

  // any time escape is pressed, blur the active element at least
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Escape') {
      document.activeElement.blur()
    }
  })

  // handle what happens when tab is pressed when inside the terminal input
  // should have some logic to replace terminal input text with the leading terminal input text
  document.getElementById('terminal-input').addEventListener('keydown', (event) => {
    if (event.code === 'Tab') {
      event.preventDefault()
      root.cmd.tab_complete()
    }
  }, false)

  // ! old terminal
  // root.terminal = ace.edit('terminal-editor')
  // root.terminal.getSession().setMode('ace/mode/text')
  // root.terminal.setTheme('ace/theme/github')
  // root.terminal.setFontSize('16px')
  // root.terminal.setShowPrintMargin(false)
  // root.terminal.commands.addCommand({
  //   name: 'word wrap',
  //   bindKey: 'Alt-z',
  //   exec: () => {
  //     root.terminal.getSession().setUseWrapMode(!root.terminal.getSession().getUseWrapMode())
  //   }
  // })
  // root.terminal.commands.addCommand({
  //   name: 'search',
  //   bindKey: 'Ctrl-f',
  //   exec: () => {
  //     console.log('finding...')
  //     root.terminal.execCommand('find')
  //   }
  // })

  root.location = get_location()
  root.get_location = get_location
  root.navigate = navigate

  electron.ipcRenderer.on(`redirect`, (event, data) => {
    console.log(`redirecting to ${data}`)
    root.last_url = data
    root.$digest()
    if (data.startsWith('http') || data.startsWith('file')) {
      let redirect = new bootstrap.Modal(document.getElementById('redirect-modal'))
      redirect.show()
    } else {
      window.location.replace(data)
    }
  })

  // get project info
  root.project = require('../../../../package.json')
  console.log(`project info:`)
  console.log(root.project)

  root.$on('$locationChangeStart', (event) => {
    console.log('changing location...')
    root.progress.start()
  })

  // this document click listener handles all right clicks for links
  document.addEventListener('contextmenu', event => {
    let target = event.target
    if (target.hasAttribute('href')) {
      root.display_context(event.x, event.y, target.getAttribute('href'))
    }
  })

  root.$on('$locationChangeSuccess', (event) => {
    root.location = get_location()
    $('#form-location input').val(get_location())
    root.progress.done()
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

  vm.print = () => {
    electron.ipcRenderer.send('print')
  }

  function back() {
    window.history.back()
  }

  function forward() {
    window.history.forward()
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

  function refresh() {
    electron.ipcRenderer.send(`reload`)
  }

  function minimize() {
    electron.ipcRenderer.send(`minimize`)
  }

  function maximize() {
    electron.ipcRenderer.send(`maximize`)
  }

  function close() {
    electron.ipcRenderer.send(`close`)
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

/*---*/

// AngularJS rootScope documentation

/**
 * * Creates a new child scope
 * * The parent scope will propagate the $digest() event. The scope can be removed from the scope hierarchy using $destroy().
 * * $destroy() must be called on a scope when it is desired for the scope and its child scopes to be permanently detached from the parent and thus stop participating in model change detection and listener notification by invoking.
 * @param {boolean} isolate If true, then the scope does not prototypically inherit from the parent scope. The scope is isolated, as it can not see parent scope properties. When creating widgets, it is useful for the widget to not accidentally read parent state.
 * @param {*} parent The Scope that will be the $parent of the newly created scope. Defaults to this scope if not provided. This is used when creating a transclude scope to correctly place it in the scope hierarchy while maintaining the correct prototypical inheritance.
 * @returns {Object} newly created child scope
 */
function $new(isolate, parent) { }
/**
 * * Registers a listener callback to be executed whenever the watchExpression changes.
 * @param {function()|string} watchExpression expression that is evaluated on each $digest cycle. A change in the return value triggers a call to the listener.
 * @param {function()} listener Callback called whenever the value of watchExpression changes.
 * @param {boolean} objectEquality Compare for object equality using angular.equals instead of comparing for reference equality.
 * @returns {function()} Returns a deregistration function for this listener.
 */
function $watch(watchExpression, listener, objectEquality) { }
/**
 * * A variant of $watch() where it watches an array of watchExpressions. If any one expression in the collection changes the listener is executed.
 * * The items in the watchExpressions array are observed via the standard $watch operation. Their return values are examined for changes on every call to $digest.
 * * The listener is called whenever any expression in the watchExpressions array changes.
 * @param {[string]|[function()]} watchExpressions Array of expressions that will be individually watched using $watch()
 * @param {function()} listener Callback called whenever the return value of any expression in watchExpressions changes The newValues array contains the current values of the watchExpressions, with the indexes matching those of watchExpression and the oldValues array contains the previous values of the watchExpressions, with the indexes matching those of watchExpression The scope refers to the current scope.
 * @returns {function()} Returns a de-registration function for all listeners.
 */
function $watchGroup(watchExpressions, listener) { }
/**
 * * Shallow watches the properties of an object and fires whenever any of the properties change (for arrays, this implies watching the array items; for object maps, this implies watching the properties). If a change is detected, the listener callback is fired.
 * * The obj collection is observed via standard $watch operation and is examined on every call to $digest() to see if any items have been added, removed, or moved.
 * * The listener is called whenever anything within the obj has changed. Examples include adding, removing, and moving items belonging to an object or array.
 * @param {string|function()} obj Evaluated as expression. The expression value should evaluate to an object or an array which is observed on each $digest cycle. Any shallow change within the collection will trigger a call to the listener.
 * @param {function()} listener a callback function called when a change is detected.
 * @returns {function()} Returns a de-registration function for this listener. When the de-registration function is executed, the internal watch operation is terminated.
 */
function $watchCollection(obj, listener) { }
/**
 * * Processes all of the watchers of the current scope and its children. Because a watcher's listener can change the model, the $digest() keeps calling the watchers until no more listeners are firing. This means that it is possible to get into an infinite loop. This function will throw 'Maximum iteration limit exceeded.' if the number of iterations exceeds 10.
 * * Usually, you don't call $digest() directly in controllers or in directives. Instead, you should call $apply() (typically from within a directive), which will force a $digest().
 * * If you want to be notified whenever $digest() is called, you can register a watchExpression function with $watch() with no listener.
 * * In unit tests, you may need to call $digest() to simulate the scope life cycle.
 */
function $digest() { }
/**
 * * Suspend watchers of this scope subtree so that they will not be invoked during digest.
 * * This can be used to optimize your application when you know that running those watchers is redundant.
 * * Warning
 * * Suspending scopes from the digest cycle can have unwanted and difficult to debug results. Only use this approach if you are confident that you know what you are doing and have ample tests to ensure that bindings get updated as you expect.
 * * Some of the things to consider are:
 *  * Any external event on a directive/component will not trigger a digest while the hosting scope is suspended - even if the event handler calls $apply() or $rootScope.$digest().
    * Transcluded content exists on a scope that inherits from outside a directive but exists as a child of the directive's containing scope. If the containing scope is suspended the transcluded scope will also be suspended, even if the scope from which the transcluded scope inherits is not suspended.
    * Multiple directives trying to manage the suspended status of a scope can confuse each other:
    * A call to $suspend() on an already suspended scope is a no-op.
    * A call to $resume() on a non-suspended scope is a no-op.
    * If two directives suspend a scope, then one of them resumes the scope, the scope will no longer be suspended. This could result in the other directive believing a scope to be suspended when it is not.
    * If a parent scope is suspended then all its descendants will be also excluded from future digests whether or not they have been suspended themselves. Note that this also applies to isolate child scopes.
    * Calling $digest() directly on a descendant of a suspended scope will still run the watchers for that scope and its descendants. When digesting we only check whether the current scope is locally suspended, rather than checking whether it has a suspended ancestor.
    * Calling $resume() on a scope that has a suspended ancestor will not cause the scope to be included in future digests until all its ancestors have been resumed.
    * Resolved promises, e.g. from explicit $q deferreds and $http calls, trigger $apply() against the $rootScope and so will still trigger a global digest even if the promise was initiated by a component that lives on a suspended scope.
 */
function $suspend() { }
/**
 * * Call this method to determine if this scope has been explicitly suspended. It will not tell you whether an ancestor has been suspended. To determine if this scope will be excluded from a digest triggered at the $rootScope, for example, you must check all its ancestors:
 * ```javascript
function isExcludedFromDigest(scope) {
while(scope) {
if (scope.$isSuspended()) return true;
scope = scope.$parent;
}
return false;
```
* Be aware that a scope may not be included in digests if it has a suspended ancestor, even if $isSuspended() returns false.
 * @returns {true} returns true if the current scope has been suspended.
 */
function $isSuspended() { }
/**
 * * Resume watchers of this scope subtree in case it was suspended.
 * * See $rootScope.Scope for information about the dangers of using this approach.
 */
function $resume() { }
/**
 * * Removes the current scope (and all of its children) from the parent scope. Removal implies that calls to $digest() will no longer propagate to the current scope and its children. Removal also implies that the current scope is eligible for garbage collection.
 * * The $destroy() is usually used by directives such as ngRepeat for managing the unrolling of the loop.
 * * Just before a scope is destroyed, a $destroy event is broadcasted on this scope. Application code can register a $destroy event handler that will give it a chance to perform any necessary cleanup.
 * * Note that, in AngularJS, there is also a $destroy jQuery event, which can be used to clean up DOM bindings before an element is removed from the DOM.
 */
function $destroy() { }
/**
 * * Executes the expression on the current scope and returns the result. Any exceptions in the expression are propagated (uncaught). This is useful when evaluating AngularJS expressions.
 * @param {string|function()} expression an AngularJS expression to be executed
 * @param {object} locals local variables object, useful for overriding values in scope.
 * @returns {*} The result of evaluating the expression.
 */
function $eval(expression, locals) { }
/**
  * * Executes the expression on the current scope at a later point in time.
  * * The $evalAsync makes no guarantees as to when the expression will be executed, only that:
  * *   * it will execute after the function that scheduled the evaluation (preferably before DOM rendering).
  * *   * at least one $digest cycle will be performed after expression execution.
  * * Any exceptions from the execution of the expression are forwarded to the $exceptionHandler service.
  * * Note: if this function is called outside of a $digest cycle, a new $digest cycle will be scheduled. However, it is encouraged to always call code that changes the model from within an $apply call. That includes code evaluated via $evalAsync.
 * @param {string|function()} expression An AngularJS expression to be executed.
 * @param {*} locals Local variables object, useful for overriding values in scope.
 */
function $evalAsync(expression, locals) { }
/**
 * * $apply() is used to execute an expression in AngularJS from outside of the AngularJS framework. (For example from browser DOM events, setTimeout, XHR or third party libraries). Because we are calling into the AngularJS framework we need to perform proper scope life cycle of exception handling, executing watches.
 * @param {string|function()} expression An AngularJS expression to be executed.
 * @returns {*} The result of evaluating the expression.
 */
function $apply(expression) { }
/**
  * * Schedule the invocation of $apply to occur at a later time. The actual time difference varies across browsers, but is typically around ~10 milliseconds.
  * * This can be used to queue up multiple expressions which need to be evaluated in the same digest.
 * @param {string|function()} expression An AngularJS expression to be executed.
 */
function $applyAsync(expression) { }
/**
  * * Listens on events of a given type. See $emit for discussion of event life cycle.
  * * The event listener function format is: function(event, args...). The event object passed into the listener has the following attributes:
  * *   * targetScope - {Scope}: the scope on which the event was $emit-ed or $broadcast-ed.
  * *   * currentScope - {Scope}: the scope that is currently handling the event. Once the event propagates through the scope hierarchy, this property is set to null.
  * *   * name - {string}: name of the event.
  * *   * stopPropagation - {function=}: calling stopPropagation function will cancel further event propagation (available only for events that were $emit-ed).
  * *   * preventDefault - {function}: calling preventDefault sets defaultPrevented flag to true.
  * *   * defaultPrevented - {boolean}: true if preventDefault was called.
 * @param {string} name Event name to listen on.
 * @param {function()} listener Function to call when the event is emitted.
 */
function $on(name, listener) { }
/**
 * * Dispatches an event name upwards through the scope hierarchy notifying the registered $rootScope.Scope listeners.
 * * The event life cycle starts at the scope on which $emit was called. All listeners listening for name event on this scope get notified. Afterwards, the event traverses upwards toward the root scope and calls all registered listeners along the way. The event will stop propagating if one of the listeners cancels it.
 * * Any exception emitted from the listeners will be passed onto the $exceptionHandler service.
 * @param {string} name Event name to emit.
 * @param {*} args Optional one or more arguments which will be passed onto the event listeners.
 * @returns {object} Event object (see $rootScope.Scope)
 */
function $emit(name, args) { }
/**
 * * Dispatches an event name downwards to all child scopes (and their children) notifying the registered $rootScope.Scope listeners.
 * * The event life cycle starts at the scope on which $broadcast was called. All listeners listening for name event on this scope get notified. Afterwards, the event propagates to all direct and indirect scopes of the current scope and calls all registered listeners along the way. The event cannot be canceled.
 * * Any exception emitted from the listeners will be passed onto the $exceptionHandler service.
 * @param {string} name Event name to broadcast.
 * @param {*} args Optional one or more arguments which will be passed onto the event listeners.
 * @returns {object} Event object, see $rootScope.Scope
 */
function $broadcast(name, args) { }

/*...*/
