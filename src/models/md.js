class MD {
  constructor() {}
  get(url, callback) {
    $.ajax({
      url: url,
      success: callback
    })
  }
  render(contents) {
    let hljs = require('highlight.js')
    let markdown = require('markdown-it')({
      html: true,
      langPrefix: 'language-',
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`
          } catch (__) { }
        }
        return `<pre class="hljs"><code>${markdown.utils.escapeHtml(str)}</code></pre>`
      }
    })
    markdown.use(require('markdown-it-attrs'), {
      allowedAttributes: []
    })
    return markdown.render(contents)
  }
}

module.exports =  new MD()