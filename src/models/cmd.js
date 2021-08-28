var cmd = {
  input: '',
  auto: '',
  /**
   * selects the command terminal
   */
  select: () => {
    document.getElementById('terminal-input').focus()
    document.getElementById('terminal-input').select()
  },
  /**
   * parses current command input
   */
  parse: () => {
    console.log('parsing command...')
    console.log($('#terminal-input').val())
    $('#terminal-input').val('')
    $('#terminal-input-auto').val('')
  },
  /**
   * interprets commands
   */
  interpret: () => {
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
  tab_complete: () => {
    console.log('tab completion!')
    if (!this.auto) { return }
    let command = $('#terminal-input').val()
    let auto = $('#terminal-input-auto').val()
    auto = auto.trim()
    $('#terminal-input').val(`${command}${auto}`)
    $('#terminal-input-auto').val('')
  }
}

module.exports = cmd