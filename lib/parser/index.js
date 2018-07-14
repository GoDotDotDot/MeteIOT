const Device = require('./device')
const DeviceMiddleware = require('./device_middleware')
const MeteParser = require('./parser')

MeteParser.Device = Device
MeteParser.DeviceMiddleware = DeviceMiddleware

module.exports = MeteParser
