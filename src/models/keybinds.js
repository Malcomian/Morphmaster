var Mousetrap = require('mousetrap')
Mousetrap.bindGlobal = require('mousetrap/plugins/global-bind/mousetrap-global-bind')

class Keybinds {
  constructor() {
    this.hotkeys = new Mousetrap()
  }
  /**
   * Bind a key combo
   * @param {string} combo key combination
   * @param {function} callback callback function
   * @param {string} [action] optional action
   */
  bind(combo, callback, action) {
    this.hotkeys.bind(combo, callback, action)
  }
  /**
   * Bind a key combo globally
   * @param {string} combo key combination
   * @param {function} callback callback function
   * @param {string} [action] optional action
   */
  bindGlobal(combo, callback, action) {
    this.hotkeys.bindGlobal(combo, callback, action)
  }
  /**
   * Reset all key combos
   */
  reset() {
    this.hotkeys.reset()
  }
  /**
   * Triggers the action bound to the given combo
   * @param {string} combo key combination to trigger
   */
  trigger(combo) {
    this.hotkeys.trigger(combo)
  }
  /**
   * Triggers all the actions bound to the given combos
   * @param {[string]} combos An array of combination strings
   */
  triggerAll(combos) {
    combos.forEach((combo) => this.hotkeys.trigger(combo))
  }
  /**
   * Unbinds the given key combination
   * @param {string} combo key combination
   */
  unbind(combo) {
    this.hotkeys.unbind(combo)
  }
  /**
   * Unbinds multiple combinations
   * @param {[string]} combos An array of combination strings
   */
  unbindAll(combos) {
    combos.forEach((combo) => this.hotkeys.unbind(combo))
  }
}

module.exports = new Keybinds()