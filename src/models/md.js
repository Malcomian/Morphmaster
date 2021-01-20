var md = (url) => {
  return render(get(url))
}

/**
 * returns the contents of a markdown file
 * @param {String} url the relative path to a markdown file within the source code
 */
function get(url) {
  var contents = ''
  $.ajax({
    async: false,
    url: url,
    success: (data) => {
      contents = data
    }
  })
  return contents
}

/**
 * converts the given markdown file contents and returns html
 * @param {String} contents text contents of a given markdown file
 */
function render(contents) {
  let hljs = require('highlight.js')
  let markdown = require('markdown-it')({
    html: true,
    langPrefix: 'language-',
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`
        } catch (__) {}
      }
      return `<pre class="hljs"><code>${markdown.utils.escapeHtml(str)}</code></pre>`
    }
  })
  markdown.use(require('markdown-it-attrs'), {
    allowedAttributes: []
  })
  return markdown.render(contents)
}

module.exports = md