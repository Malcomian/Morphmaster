module.exports = (name) => {
  return `module.exports = function () {
  return {
    template: \`${name}\`
  }
}
`
}