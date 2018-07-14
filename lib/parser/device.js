// const Emitter = require('events')
const net = require("net");

/**
 * Device改造函数提供和net.connect一致的参数
 * 主要用于建立TCP连接、注册事件
 */
class Device {
  constructor(port, ip) {
    this.client = null;
    this.port = port;
    this.ip = ip;
    this.id = `${ip}:${port}`;
    this.command = null;
    this.middlewares = []
  }
  on(event, callback) {
    if (!(this.client instanceof net.Socket)) {
      throw TypeError(`${this.client} must be a instance of net.Socket!`);
    }
    this.client.on(event, callback);
  }
  sendCommand(command) {
    this.command = command;
    this.client && this.client.write(command);
    // console.log('发送命令')
  }
  remove(event, listener) {
    this.client.removeListener(event, listener);
  }

  _connect() {
    console.log(`${this.id} connected!`);
  }
  _error(err) {
    console.info(`${this.id} error!error message:`,err);
  }
  _closed() {
    console.log(`${this.id} connection closed!`);
   
  }
  _timeout() {
    console.info(`${this.id} connection timeout!`);
   
  }

  start(app,deviceId,middlewares) {
    if(!middlewares){
      // 重新连接所需
      if(this.middlewares.length < 1){
        return console.error('device start 函数缺少middleware')
      }
    }
    if(middlewares){
      for (let i = 0; i < middlewares.length; i++) {
        const Middleware = middlewares[i];
        this.middlewares[i] = new Middleware(app,deviceId)
      }
    }
    this.client = net.connect(this.port, this.ip);
   
   
    // default event 给client注册事件
    this.on("connect", this._connect.bind(this));
    this.on("error", this._error.bind(this));
    this.on("closed", this._closed.bind(this));
    this.on("timeout", this._timeout.bind(this));

    this.on("connect",()=>{

      for (let j = 0; j < this.middlewares.length; j++) {
        const minddleware = this.middlewares[j];
        const events = minddleware.getAllEvents();
        for (const key in events) {
          if (events.hasOwnProperty(key)) {
            const calls = events[key];
            for (let index = 0; index < calls.length; index++) {
              const call = calls[index];
              this.on(key, call);
            }
          }
        }
      }
    })
    
  }
}
module.exports = Device;
