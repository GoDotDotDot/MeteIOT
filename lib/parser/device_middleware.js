// const Emitter = require('events')
const Device = require('./device')

class Middleware {
  constructor (...args) {
    const [app, deviceId] = [...args]
    this.events = {}
    this.app = app
    // 需要做判断，判断是否存在该设备
    this.device = app.devices[deviceId].device
    if (!(this.device instanceof Device)) throw TypeError(`device must be a instance of Device, except a instance of Device,but got ${typeof device}.You maybe forget use super(device) in your device middleware constructor or forget pass device instance to your device middleware constructor!`)

    // default event 给client注册事件
    this.on('error', this._error.bind(this))
    this.on('closed', this._closed.bind(this))
    this.on('timeout', this._timeout.bind(this))
  }
  remove (event) {
    this.device.remove(event, this.events[event])
    delete this.events[event]
  }
  on (event, callback) {
    const call = (dt) => {
      const data = callback(dt)
      if (!data) return false
      const deviceId = this.device.id
      // 为了方便统一使用app.emit触发全局data事件，这里修改原始callback，将导致一个事件只能注册一个事件处理器
      this.app.emit('data', {deviceId, data})
    }
    // 暂时只支持一个事件
    this.events[event] = call
  }
  getEvent (event) {
    return this.events[event]
  }
  getAllEvents (event) {
    return this.events
  }
  _error (err) {
    console.log(`${this.constructor.name} error!`)
    throw Error(err)
  }
  _closed () {
    console.log(`${this.constructor.name} connection closed!`)
  }
  _timeout () {
    console.log(`${this.constructor.name} connection timeout!`)
  }
}

module.exports = Middleware