const {MeteParser} = require('../index')

const NO_DATA = '0000000000000000000000000000000000000000000000'

class MiddleWareGrating extends MeteParser.DeviceMiddleware {
  constructor (app, deviceId) {
    super(app, deviceId)
    // this.device = device
    this.body = Buffer.alloc(0)

    this.on('connect', () => {
      console.log('connected', deviceId)
    })
    this.on('data', this.onData.bind(this))
  }
  onData (data) {
    try {
      this.device.client.pause()
      const hex = data.toString('hex')
      const dataString = String.prototype.slice.call(hex, 6, hex.length - 2)
      this.device.client.resume()

      if (dataString === NO_DATA) return false
      const to10 = parseInt(hex, 16)
    // console.log(to10.toString(2))
      return hex
    } catch (err) {
      debugger
    }
  }
}
// setInterval(randomSwitchToggle, 1000)
module.exports = MiddleWareGrating
