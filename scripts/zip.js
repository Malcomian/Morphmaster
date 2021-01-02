/**
 * Make sure 7zip is installed!
 */

const readline = require('readline');
const package = require('../package.json')
const cmd = require('child_process')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var comment = ''

rl.question('Comment for this archive (optional): ', (answer) => {
  if (answer) {
    comment = `${answer}`
  }
  zip()
  rl.close();
});

function zip() {
  let date = new Date()
  // let datestamp = new Intl.DateTimeFormat('en-US').format(date)

  let yyyy = date.toLocaleString('en-US', {
    year: 'numeric'
  })
  let mm = date.toLocaleString('en-US', {
    month: 'numeric'
  })
  let dd = date.toLocaleString('en-US', {
    day: 'numeric'
  })

  let datestamp = `${yyyy}-${mm}-${dd}`
  let timestamp = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  }).format(date)

  timestamp = timestamp.split(':').join('-')

  let dirname = __dirname
  dirname = dirname.split('\\')
  dirname.pop()
  dirname = dirname[dirname.length - 1]

  let name = `${dirname}_${datestamp}_${timestamp}`

  if (comment.length > 0) {
    name = `${name} - ${comment}`
  }

  name = `${name}.zip`

  console.log(`...creating new archive, "${name}"`)

  let output_path = `${__dirname}`
  output_path = output_path.split('\\')
  output_path.pop()
  output_path.pop()
  output_path = output_path.join('\\')

  cmd.exec(`"%ProgramFiles%\\7-Zip\\7z.exe" a "${output_path}\\${name}" ..\\${dirname}\\* -x!node_modules -x!dist -x!build`, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error}`)
      return
    }
    console.log(`${stdout}`)
    // console.error(`${stderr}`)
  })
}