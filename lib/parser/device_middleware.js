const Device = require("./device");

class DeviceMiddleware {
  constructor(app, deviceId) {
    if (Object.getPrototypeOf(app).constructor.name !== 'MeteParser' || typeof deviceId !== 'string' ) {
      throw TypeError(
        `Middleware need two params(app and deviceId), app must be a instance of MeteParser but got ${typeof app}, deviceId must be a string of Device id but got ${typeof deviceId}. 
        You maybe forget use super(app,deviceId) in your device middleware constructor or forget pass app instance and deviceId to your device middleware constructor!
        `
      );
    }
    
    this.events = {};
    this.app = app;
    // 需要做判断，判断是否存在该设备
    this.device = app.devices[deviceId].device;
    if (Object.getPrototypeOf(this.device).__proto__.constructor.name !== 'Device' )
      throw TypeError(
        `device must be a instance of Device, except a instance of Device,but got ${typeof this.device}.You maybe forget use super(device) in your device middleware constructor or forget pass device instance to your device middleware constructor!`
      );
  }
  remove(event) {
    this.device.remove(event, this.events[event]);
    delete this.events[event];
  }
  on(event, callback) {
    const call = dt => {
      const data = callback(dt);
      if (!data) return;
      if (data && Object.prototype.toString.call(data) !== "[object Object]") {
        throw TypeError(
          `the onData callback function excepte [object Object],but get ${typeof data}`
        );
      }
      // const deviceId = this.device.id
      // this.app.emit('data', {deviceId, data})
      // 为了方便统一使用app.emit触发全局data事件，这里修改原始callback，将导致一个事件只能注册一个事件处理器
      this.app.emit("data", data);
    };
    const events = this.events
    let existing = events[event]
    // 判断是否存在，存在即push，不存在即新建数组
    if(existing){
      this.events[event].push(call)
    }else{
      existing = this.events[event] = [call]
    }
    // this.events[event] = call;
  }
  addTime(obj) {
    if (Object.prototype.toString.call(obj) !== "[object Object]") {
      throw TypeError(`the obj excepte [object Object],but get ${typeof obj}`);
    }
    obj["createTime"] = new Date().toLocaleString();
    return obj;
  }
  getEvent(event) {
    return this.events[event];
  }
  getAllEvents(event) {
    return this.events;
  }
}

module.exports = DeviceMiddleware;
