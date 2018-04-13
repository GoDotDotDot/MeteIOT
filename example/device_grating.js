const {MeteParser} = require('../index')

class DeviceGrating extends MeteParser.Device {
  constructor (...args) {
    super(...args)
    this.id = '光栅'
  }
}

module.exports = new DeviceGrating(4001, '192.168.0.20')
