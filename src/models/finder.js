/*---*/
const remote = require('electron').remote
/*...*/

// ! the input always counts as a match, but it's not like it matters much

var finder = {
  /**
   * searches for the text given in the finder input
   */
  search() {
    let query = $('#finder').val()
    if (query.length < 1) return
    // console.log(`Searching for "${query}"...`)
    // if (this.last != query || this.result.activeMatchOrdinal == this.result.matches - 1) {
    //   this.searching = false
    // }
    if (this.last != query) {
      this.searching = false
    }
    if (!this.searching) {
      this.clear()
      // console.log('first search...')
      remote.getCurrentWebContents().findInPage(query, {
        matchCase: this.match
      })
      this.searching = true
      this.last = query
    } else {
      // console.log('searching again...')
      remote.getCurrentWebContents().findInPage(query, {
        findNext: true,
        matchCase: this.match
      })
    }
  },
  /**
   * reverse searches for the text given in the finder input
   */
  reverse() {
    let query = $('#finder').val()
    if (query.length < 1) return
    // if (this.last != query || this.result.activeMatchOrdinal == 1) {
    //   this.searching = false
    // }
    if (this.last != query) {
      this.searching = false
    }
    if (!this.searching) {
      this.clear()
      remote.getCurrentWebContents().findInPage(query, {
        forward: false,
        matchCase: this.match
      })
      this.searching = true
      this.last = query
    } else {
      remote.getCurrentWebContents().findInPage(query, {
        forward: false,
        findNext: true,
        matchCase: this.match
      })
    }
    // console.log(`Reverse searching for "${query}"...`)
    // remote.getCurrentWebContents().findInPage(query, {
    //   forward: false,
    //   findNext: true
    // })
  },
  /**
   * opens the finder window
   */
  open() {
    $('#finder-div').removeClass('d-none')
    setTimeout(() => {
      document.getElementById('finder').select()
    }, 25)
  },
  /**
   * closes the finder window
   */
  close() {
    // this.last = $('#finder').val()
    $('#found').text('') // reset active/matches
    this.clear()
    this.searching = false
    $('#finder-div').toggleClass('d-none')
  },
  /**
   * Clears selection and resets results
   */
  clear() {
    remote.getCurrentWebContents().stopFindInPage('clearSelection')
    this.result = {
      activeMatchOrdinal: 0,
      finalUpdate: true,
      matches: 0,
      requestId: 0,
      selectionArea: {
        height: 0,
        width: 0,
        x: 0,
        y: 0
      }
    }
  },
  /**
   * initializes the finder
   */
  init() {
    // register the found in page event one second after app launch
    setTimeout(() => {
      remote.getCurrentWebContents().on('found-in-page', (event, result) => {
        this.result = result
        console.log(`active: ${this.result.activeMatchOrdinal}, matches: ${this.result.matches}`)
        // matches is one less because the input counts as one
        document.getElementById('found').innerText = `${result.activeMatchOrdinal}/${result.matches - 1}`
      })
    }, 1000)
  },
  result: {
    activeMatchOrdinal: 0,
    finalUpdate: true,
    matches: 0,
    requestId: 0,
    selectionArea: {
      height: 0,
      width: 0,
      x: 0,
      y: 0
    }
  },
  searching: false,
  last: '',
  match: false,
  /**
   * toggles case sensitivity
   */
  case() {
    this.match = !this.match
  }
}

module.exports = finder