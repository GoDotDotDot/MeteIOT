const {MeteParser} = require('../index')
const app = new MeteParser({
  stationId: '0001'
})
const io = require('socket.io-client')
const deviceTempreature = require('./device_tempreature')
const middlewareTemperature = require('./middleware_temperature')
const deviceGrating = require('./device_grating')
const middlewareGrating = require('./middleware_grating')

const socket = io('http://127.0.0.1:8080/stationClient', {
  query: {
    stationId: '0001',
    account: 'xzzm',
    password: 'xzzm'
  }
})

socket.on('error', function (err) {
  console.log(err)
})
socket.on('command', function (deviceId, command) {
  console.log(command)
  app.sendCommand(deviceId, parseInt(command))
})

// 1.注册设备驱动和设备中间件
app.register(deviceTempreature, middlewareTemperature)
app.register(deviceGrating, middlewareGrating)

// 2.注册中间件
app.use((ctx, next) => {
  const { body } = ctx
  console.log(`use1:`, body)
  next()
  return '------中间件全部成功运行------'
})

app.use((ctx, next) => {
  const { body } = ctx
  console.log(`use2:`, body)
  next()
})

app.use((ctx, next) => {
  const { body } = ctx
  socket.emit('data', body)
})

// 3.启动
app.start()
