const fs = require('fs')

/**
 * * Get package.json
 */
var package = require('../package.json');

/**
 * * Update version number based on arguments
 * * format: major.minor.patch - defaults to patch.
 */

var original = package.version;

var version = package.version.split('.');
var major = Number(version[0]);
var minor = Number(version[1]);
var patch = Number(version[2]);

var arg = process.argv.slice(2)[0];

if (arg == 'patch') {
  patch++
};
if (arg == 'minor') {
  minor++
  patch = 0
};
if (arg == 'major') {
  patch = 0
  minor = 0
};
if (arg == 'set') {
  console.log('setting version...')
  let set = process.argv.slice(2)[1]
  let parts = set.split('.')
  if (parts.length != 3) {
    console.log(`cannot set version number, "${set}"! Try "set <major>.<minor>.<patch>"!`)
    return
  }
  major = Number(parts[0])
  minor = Number(parts[1])
  patch = Number(parts[2])
}

if (arg != 'patch' && arg != 'minor' && arg != 'major' && arg != 'set') {
  console.log(`Incorrect version update type, "${arg}" specified - please try "patch" (default), "minor", "major", or "set <major>.<minor>.<patch>"!`);
  console.log('Ending script...')
  return;
}

package.version = `${major}.${minor}.${patch}`;

/**
 * * Setup target directory and result
 */

const path = require('path')
var dirname = __dirname;
dirname = dirname.split('\\')
dirname.pop()
dirname = dirname.join('\\')
var target = path.join(dirname, `package.json`)

var result = JSON.stringify(package, null, 2)

fs.writeFileSync(target, result)

console.log(`Updated package version from ${original} to ${package.version}`);