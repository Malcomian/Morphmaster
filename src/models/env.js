const fs = require('fs-extra')

class Environment {
  constructor(app_name) {
    this.app_name = app_name;
    this.app_path = process.env.APPDATA;
    this.path = '';
  }
  load() {
    console.log('loading environment variables...')
    if (!fs.existsSync(`${this.app_path}`)) {
      // console.log(`couldn't find the AppData folder`);
      return false;
    } else {
      // console.log(`there's a Roaming AppData storage!`)
      if (!fs.existsSync(`${this.app_path}\\${this.app_name}`)) {
        // console.log(`there's no save folder! creating new save folder...`);
        fs.mkdirSync(`${this.app_path}\\${this.app_name}`);
      }
      this.path = `${this.app_path}\\${this.app_name}`;
    }
  }
  reload(obj) {
    console.log('reloading environment variables...')
    this.app_name = obj.app_name;
    this.app_path = obj.app_path;
    this.path = obj.path;
  }
}

module.exports = Environment;