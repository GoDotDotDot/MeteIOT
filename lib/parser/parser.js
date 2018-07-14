const Emitter = require('events')
// const meteiot = require('meteiot')
const Device = require('./device')
const DeviceMiddleware = require('./device_middleware')
const compose = require('./compose')
const pkg = require('../../package.json')
class MeteParser extends Emitter {
  constructor (opts) {
    super()

    if (!opts.id) {
      throw Error(`Id is required and the type must be string,but get ${typeof opts.id}`)
    }

    this.devices = {}
    this.middlewares = [] // 中间件需要返回状态值，以判断是否数据完毕
    this.ctx = {
      body: {
        data: {},
        id: opts.id
      },
      sendCommand: this.sendCommand
    }
    this.timeLine = []
    this.on('data', this.globalOnDataHandle.bind(this))
    console.log(`Welcome to use MeteParser, current version is ${MeteParser.version}`)
  }
  use (middlewares) {
    this.middlewares.push(middlewares)
  }
  sendCommand (id, command, timeLine) {
    if (!this.devices[id]) {
      return console.error(`the device(id:${id}) is not be registed!`)
    }
    if (timeLine) {
      this.timeLine.push(timeLine)
    }
    this.devices[id].device.sendCommand(command)
  }
  globalOnDataHandle (decodeData) {
    // 若decodeData为空 则不触发中间件use函数
    if (!decodeData) return
    // 以中间件形式广播
    const fn = compose(this.middlewares)
    // const {deviceId, data} = decodeData
    // const oriData = this.ctx.body.data[deviceId] || {}
    // this.ctx.body.data = {deviceId,...data}
    const body = {
      ...this.ctx.body,
      data: decodeData
    }
    this.ctx.body = body
    fn(this.ctx).then(rst => {
      console.log(rst)
      // 如进入此处说明全部处理成功！
    }).catch(err => {
      // 若进入此处说明有失败
      console.log(`error info: ${err}`)
    })
    // console.log(data)
  }
  register (device, ...middlewares) {
    if (!(device instanceof Device)) {
      throw TypeError(`${device} must be a instance of Device!`)
    }
    for (let i = 0; i < middlewares.length; i++) {
      const middleware = middlewares[i]
      if (Object.getPrototypeOf(middleware) !== DeviceMiddleware) {
        throw TypeError(`${middleware} must be inherit from Middleware!`)
      }
    }

    const {devices} = this
    const { id } = device // 根据设备id来存储
    // 监测是否注册相同设备
    for (const key in devices) {
      if (devices.hasOwnProperty(key)) {
        if (key === id) { throw Error(`${key} had be registed! Maybe you register the same device again!`) }
      }
    }
    this.devices[id] = {device, middlewares} // 注册设备、中间件
  }
  start () {
    const {devices} = this
    for (const key in devices) {
      if (devices.hasOwnProperty(key)) {
        const {device, middlewares} = devices[key]
        // const DeviceMiddleware = middlewares
        device.start(this, device.id, middlewares)
      }
    }
  }
}

MeteParser.version = pkg.version

module.exports = MeteParser
