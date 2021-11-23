module.exports = function () {
  return function (url, width, height) {
    if (!width) {
      width = 480
    }
    if (!height) {
      height = 270
    }
    let result = `<iframe src="https://www.youtube.com/embed/${url}" width="${width}" height="${height}" frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    return result;
  }
}