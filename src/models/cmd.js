var cmd = {
  input: '',
  auto: '',
  history: {
    commands: [],
    position: -1
  },
  /**
   * selects the command terminal
   */
  select() {
    document.getElementById('terminal-input').focus()
    document.getElementById('terminal-input').select()
  },
  /**
   * parses current command input
   */
  parse() {
    console.log('parsing command...')
    let command = $('#terminal-input').val()
    if (!command) return
    console.log(this)
    this.history.commands.unshift(command)
    this.run(command)
    // clear command
    this.history.position = -1
    $('#terminal-input').val('')
    $('#terminal-input-auto').val('')
  },
  /**
   * Runs a terminal command
   * @param {string} command command string to run
   */
  run(command) {
    console.log(command)
    $('#terminal-body').append($.parseHTML(`<div>> ${command}</div>`))
  },
  /**
   * interprets commands
   */
  interpret() {
    console.log('interpreting command...')
    let command = $('#terminal-input').val()
    if ((command) == 'hi') {
      console.log(`found command, ${command}`)
      let blank = ' '
      let whitespace = ''
      for (let i = 0; i < command.length; i++) {
        whitespace += blank
      }
      this.auto = `${whitespace}!!!`
    } else {
      this.auto = ''
    }
    $('#terminal-input-auto').val(this.auto)
  },
  /**
   * handles tab completion
   * - only assigns a tab completion if one exists
   */
  tab_complete() {
    console.log('tab completion!')
    if (!this.auto) { return }
    let command = $('#terminal-input').val()
    let auto = $('#terminal-input-auto').val()
    auto = auto.trim()
    $('#terminal-input').val(`${command}${auto}`)
    $('#terminal-input-auto').val('')
  },
  /**
   * goes up in command history
   */
  up() {
    if (this.history.position == this.history.commands.length - 1) return
    this.history.position++
    $('#terminal-input').val(this.history.commands[this.history.position])
  },
  /**
   * goes down in command history
   */
  down() {
    if (this.history.position == -1) return
    this.history.position--
    $('#terminal-input').val(this.history.commands[this.history.position])
  }
}

module.exports = cmd