module.exports = function () {
  // zero will also return true
  return function (num, phrase) {
    if (num % 2 == 0) {
      return phrase
    } else {
      return ''
    }
  }
}