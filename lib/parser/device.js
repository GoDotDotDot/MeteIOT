// const Emitter = require('events')
const net = require("net");
const utils = require("./utils");

/**
 * Device改造函数提供和net.connect一致的参数
 * 主要用于建立TCP连接、注册事件
 */
class Device {
  constructor(...args) {
    this.id = "device id";
    this.client = null;
    this.args = args;
    this.command = null;
  }
  on(event, callback) {
    if (!(this.client instanceof net.Socket)) {
      throw TypeError(`${this.client} must be a instance of net.Socket!`);
    }
    this.client.on(event, callback);
  }
  sendCommand(command) {
    this.command = command;
    this.client.write(command);
  }
  remove(event, listener) {
    this.client.removeListener(event, listener);
  }

  _connect() {
    console.log(`${this.constructor.name} connected!`);
  }
  _error(err) {
    console.info(`${this.constructor.name} error!error message:`,err);
  }
  _closed() {
    console.log(`${this.constructor.name} connection closed!`);
   
  }
  _timeout() {
    console.info(`${this.constructor.name} connection timeout!`);
   
  }

  start(minddleware) {
    this.client = net.connect(...this.args);
    this.client.setTimeout(10000);

    // default event 给client注册事件
    this.on("connect", this._connect.bind(this));
    this.on("error", this._error.bind(this));
    this.on("closed", this._closed.bind(this));
    this.on("timeout", this._timeout.bind(this));

    const events = minddleware.getAllEvents();
    for (const key in events) {
      if (events.hasOwnProperty(key)) {
        const call = events[key];
        this.on(key, call);
      }
    }
  }
}
module.exports = Device;
