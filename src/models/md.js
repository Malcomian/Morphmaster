class MD {
  constructor() {}
  /**
   * Get markdown file contents using $.ajax
   * @param {string} url location to read markdown file from
   * @param {Function} callback a callback function to call on a successful ajax call
   */
  get(url, callback) {
    $.ajax({
      url: url,
      success: callback
    })
  }
  /**
   * Render markdown file
   * @param {string} contents markdown file contents
   * @returns {string} html string
   */
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