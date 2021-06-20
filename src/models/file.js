const fs = require('fs-extra')
const resolve = require('path').resolve

class File {
  constructor() {
    this.filename = ''
    this.ext = '.json'
  }
  /**
   * creates the file if one does not already exist in the target directory
   * - returns true if successful
   * - returns false if not successful
   * @param {String} path folder path
   * @param {String} filename filename without extension
   */
  create(path, filename) {
    this.filename = filename
    if (fs.existsSync(resolve(`${path}/${this.filename}${this.ext}`))) {
      console.log(`there's already a file name, "${this.filename}${this.ext}"!`)
      return false
    }
    console.log(`creating new file, "${this.filename}${this.ext}"...`)
    return this.save(path)
  }
  /**
   * saves the file so long as this object has a filename
   * - returns true if successful
   * - returns false if not successful
   * @param {String} path folder path
   */
  save(path) {
    if (this.filename == '') return false
    console.log(`saving file, "${this.filename}${this.ext}"...`)
    fs.outputFileSync(resolve(`${path}/${this.filename}${this.ext}`), JSON.stringify(this))
    return true
  }
  /**
   * loads the file from disk and sets all similar properties and their values on this object
   * - returns true if successful
   * - returns false if not successful
   * @param {String} path folder path
   * @param {String} filename filename without extension
   */
  load(path, filename) {
    this.filename = filename
    if (!fs.existsSync(resolve(`${path}/${this.filename}${this.ext}`))) {
      console.log(`there's no file, "${this.filename}${this.ext}"!`)
      return false
    }
    console.log(`loading existing file, "${this.filename}${this.ext}"`)
    let data = fs.readFileSync(resolve(`${path}/${this.filename}${this.ext}`))
    data = JSON.parse(data)
    for (const item in this) {
      if (this.hasOwnProperty(item) && data.hasOwnProperty(item)) {
        this[item] = data[item]
      }
    }
    return true
  }
  /**
   * copies the target file by copying all the target file's properties onto this object
   * - returns true if successful
   * - returns false if not successful
   * @param {String} path folder path
   * @param {String} filename filename without extension
   */
  copy(path, filename) {
    this.filename = filename
    if (!fs.existsSync(resolve(`${path}/${this.filename}${this.ext}`))) {
      console.log(`there's no file, "${this.filename}${this.ext}"!`)
      return false
    }
    console.log(`copying data off existing file, "${this.filename}${this.ext}"`)
    let data = fs.readFileSync(resolve(`${path}/${this.filename}${this.ext}`))
    data = JSON.parse(data)
    for (const item in data) {
      if (data.hasOwnProperty(item)) {
        const element = data[item];
        this[`${item}`] = element;
      }
    }
    return true
    }
  /**
   * ensures the file exists
   * - if it doesn't exist, it is created
   * - if it does exist, load it
   * - returns true if successful
   * - returns false if not successful
   * @param {String} path folder path
   * @param {String} filename filename without extension
   */
  ensure(path, filename) {
    if (!fs.existsSync(resolve(`${path}/${filename}${this.ext}`))) {
      this.filename = filename
      return this.save(path)
    }
    return this.load(path, filename)
  }
}

module.exports = File