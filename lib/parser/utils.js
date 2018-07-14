const Device = require("./device");

/**
 * 断线重连
 * @param {Number} time
 * @param {Array} args
 * @return 计时器ID
 */
exports.reconnect = function(device, time) {
  if (typeof time !== "number") {
    throw TypeError(`time must be a Number,but get ${typeof time}`);
  }
  if (!(device instanceof Device)) {
    throw TypeError(`${device} must be a instance of Device!`);
  }
  // 小于0 则不进行重新连接
  if(time < 0){
    return null
  }
  if(device.reconnectId)return

  return setTimeout(() => {
    try {
      console.info(`device ${device.id} reconnectting...`);
      device.start();
    } catch (err) {
      console.error(err);
    }finally{
      clearTimeout(device.reconnectId);
    }
  }, time);
};

module.exports.bufferStartWith = function(buf, target) {
  if (!Buffer.isBuffer(buf) || !Buffer.isBuffer(target)) {
    throw TypeError("must be Buffer");
  }
  const tLen = target.length;
  if (buf.length < tLen) {
    throw Error("The target buffer length must greater than source buffer!");
  }
  const srcBuf = buf.slice(0, tLen);
  return target.equals(srcBuf);
};
module.exports.bufferEndWith = function(buf, target) {
  if (!Buffer.isBuffer(buf) || !Buffer.isBuffer(target)) {
    throw TypeError("must be Buffer");
  }
  const tLen = target.length;
  const srcLen = buf.length;
  if (buf.length < tLen) {
    throw Error("The target buffer length must greater than source buffer!");
  }
  const srcBuf = buf.slice(-1 * tLen);
  return target.equals(srcBuf);
};
