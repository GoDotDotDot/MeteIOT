const {MeteParser} = require('../index')

class DeviceTemperature extends MeteParser.Device {
  constructor (...args) {
    super(...args)
    this.id = '温度传感器'
  }
  sendCommand (command) {
        // 第三个位置插入新数据
    const buf1 = Buffer.from([0xAA, 0xA3, 0x01])
    const buf2 = Buffer.from([0xFF, 0x55])
    // const numberToHex = command.toString(16)
    const commandBuf = Buffer.from([command])
    const buf = Buffer.concat([buf1, commandBuf, buf2, buf1, commandBuf, buf2])
    super.sendCommand(buf)
  }
}

/**
 * TODO:
 * 此处连接地址需要更改到以配置形式运行
 */

module.exports = new DeviceTemperature(4196, '192.168.0.200')
