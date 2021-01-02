const File = require('./file')

class Config extends File {
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.width = 1280;
    this.height = 720;
    this.min_width = 640;
    this.min_height = 480;
    this.zoom = 1;
    this.maximized = false;
    this.last_url = '#!'
  }
}

module.exports = Config;