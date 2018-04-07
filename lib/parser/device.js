// const Emitter = require('events')
const net = require('net')

/**
 * Device改造函数提供和net.connect一致的参数
 * 主要用于建立TCP连接、注册事件
 */
class Device {
  constructor (...args) {
    this.id = 'device id'
    this.client = null
    this.args = args
    this.command = null
  }
  on (event, callback) {
    if (!(this.client instanceof net.Socket)) {
      throw TypeError(`${this.client} must be a instance of net.Socket!`)
    }
    this.client.on(event, callback)
  }
  sendCommand (command) {
    this.command = command
    this.client.write(command)
  }
  remove (event, listener) {
    this.client.removeListener(event, listener)
  }
  async start (minddleware) {
    this.client = await net.connect(...this.args)
    const events = minddleware.getAllEvents()
    for (const key in events) {
      if (events.hasOwnProperty(key)) {
        const call = events[key]
        this.on(key, call)
      }
    }
  }
}
module.exports = Device
