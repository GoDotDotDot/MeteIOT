const Emitter = require('events')
const Device = require('./device')
const Middleware = require('./device_middleware')
const compose = require('./compose')
class MeteParser extends Emitter {
  constructor (opts) {
    super()

    if (typeof opts.stationName !== 'string') {
      throw Error(`staionId is required and the type must be string,but get ${typeof opts.stationName}`)
    }

    this.devices = {}
    this.middlewares = [] // 中间件需要返回状态值，以判断是否数据完毕
    this.ctx = {
      body: {
        data: {},
        stationName: opts.stationName
      },
      sendCommand: this.sendCommand
    }
    this.on('data', this.globalOnDataHandle)
    console.log(`Welcome to use MeteParser, current version is ${MeteParser.version}`)
  }
  use (middlewares) {
    this.middlewares.push(middlewares)
  }
  sendCommand (id, command) {
    if (!this.devices[id]) {
      return console.error(`the device(id:${id}) is not be registed!`)
    }
    this.devices[id].device.sendCommand(command)
  }
  globalOnDataHandle (decodeData) {
    // 以中间件形式广播
    const fn = compose(this.middlewares)
    // 若decodeData为空 则不触发中间件use函数
    if(decodeData){}
    const {deviceId, data} = decodeData
    const oriData = this.ctx.body.data[deviceId] || {}
    this.ctx.body.data[deviceId] = {...oriData,...data}
    fn(this.ctx).then(rst => {
      console.log(rst)
      // 如进入此处说明全部处理成功！
    }).catch(err => {
      // 若进入此处说明有失败
      console.log(err)
    })
    // console.log(data)
  }
  register (device, middleware) {
    if (!(device instanceof Device)) {
      throw TypeError(`${device} must be a instance of Device!`)
    }
    if (Object.getPrototypeOf(middleware) !== Middleware) {
      throw TypeError(`${middleware} must be inherit from Middleware!`)
    }
    const {devices} = this
    const { id } = device // 根据设备id来存储
    // 监测是否注册相同设备
    for (const key in devices) {
      if (devices.hasOwnProperty(key)) {
        if (key === id) { throw Error(`${key} had be registed! Maybe you register the same device again!`) }
      }
    }
    this.devices[id] = {device, middleware} // 注册设备、中间件
  }
  start () {
    const {devices} = this
    for (const key in devices) {
      if (devices.hasOwnProperty(key)) {
        const {device, middleware} = devices[key]
        const DeviceMiddleware = middleware
        device.start(new DeviceMiddleware(this, device.id))
      }
    }
  }
}

MeteParser.version = 'v1.0'

module.exports = MeteParser
