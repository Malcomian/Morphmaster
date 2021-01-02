module.exports = function () {
  return function (data, phrase) {
    if (data == true) {
      return `${phrase}`;
    } else {
      return '';
    }
  }
}