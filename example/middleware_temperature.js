const {MeteParser} = require('../index')

class MiddleWareTeampreature extends MeteParser.DeviceMiddleware {
  constructor (app, deviceId) {
    super(app, deviceId)
    this.body = Buffer.alloc(0)
    this.randomSwitchToggle = this.randomSwitchToggle.bind(this)

    this.on('connect', () => {
      console.log('connected', deviceId)
    })

    this.on('data', this.onData.bind(this))

    setInterval(this.randomSwitchToggle, 2000)
  }
  onData (data) {
    // 获取温度数据
    this.body = Buffer.concat([this.body, data])
    if (this.body.length >= 12) {
      const temprature = this.body.slice(3, 4)
      const temprature10 = parseInt(temprature.toString('hex'), 16)
      const temprature2 = temprature10.toString(2).padStart(8, 0)
      const unit = temprature2[0] === '0' ? '+' : '-'
      // console.log(`长度：${this.body.length}`, `hex：${this.body.toString('hex')}`, `温度：${unit}${temprature10}`)
      this.body = Buffer.alloc(0)
      return temprature10
    }
  }
  randomSwitchToggle () {
    // 第三个位置插入新数据
    const buf1 = Buffer.from([0xAA, 0xA3, 0x01])
    const buf2 = Buffer.from([0xFF, 0x55])

    // const number = getRandomIntInclusive(0, 15)
    const number = 15
    // const numberToHex = number.toString(16)
    // const command = Buffer.from([numberToHex])
    // const buf = Buffer.concat([buf1, command, buf2, buf1, command, buf2])
  // 测试代码
    // const buf1111 = Buffer.from([0xAA, 0xA3, 0x01, 0xFF, 0x0D, 0x55, 0xAA, 0xA3, 0x01, 0xFF, 0xFF, 0x55])

  //   client.write(buf)
  console.log('sendcmmand',number)
  this.device.sendCommand(number)
/*  
    const cmd = this.device.command
    if (cmd && Buffer.isBuffer(cmd)) {
      // this.device.__proto__.sendCommand.call(this.device, this.device.command)
      this.device.__proto__.__proto__.sendCommand.call(this.device, cmd)
    } else {
      this.device.sendCommand(number)
    }*/
  }
}
function getRandomIntInclusive (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
}

// setInterval(randomSwitchToggle, 1000)
module.exports = MiddleWareTeampreature
