// morph.js
// changes package name properties based on the project folder name

const fs = require('fs-extra')
const path = require('path')

var package = require('../package.json')

console.log(`Morphing package "${package.name}" @ "${__dirname}"...`)

let dirname = __dirname
dirname = dirname.split(path.sep)
dirname.pop()
let name = dirname[dirname.length - 1]

dirname = dirname.join(path.sep)

package.name = name
console.log(`New package name: "${package.name}"`)
package.build.appId = name
console.log(`New build appId: ${package.build.appId}`)

const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

var product_name = ''
rl.question('New productName (defaults to package name): ', (answer) => {
  if (answer) {
    product_name = `${answer}`
  } else {
    product_name = name
  }
  package.build.productName = product_name
  console.log(`New build productName: ${package.build.productName}`)
  save()
  rl.close()
})

function save() {
  var result = JSON.stringify(package, null, 2)
  fs.writeFileSync(path.resolve(`${dirname}/package.json`), result)
  console.log(`Successfully updated package`)
}