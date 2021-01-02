module.exports = function () {
  return function (data, phrase) {
    if (data == false) {
      return `${phrase}`;
    } else {
      return '';
    }
  }
}