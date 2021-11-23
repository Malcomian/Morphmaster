module.exports = function ($interpolate) {
  return function (url, target) {
    if (!url || !target) return
    fetch(url).catch(() => {
      console.log(`Couldn't fetch template at ${url}!`)
    }).then(res => {
      res.text().then(text => {
        if (!text) return
        console.log(`got text:`)
        console.log(text)
        $(target).html($interpolate(text))
      })
    })
  }
}