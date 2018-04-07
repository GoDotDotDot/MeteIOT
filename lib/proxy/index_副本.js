const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const router = require('./router')
const session = require('koa-session')
const app = new Koa()
const session_config = require('./config/session.config')

app.keys = ['mete-iot-server']
app.use(session(session_config, app))

app.use(bodyParser())

app.use(router.routes()).use(router.allowedMethods())

// http start
const http = require('http')
const server = http.createServer(app.callback())
const io = require('socket.io')(server)

// 站点客户端websocket房间
const stationClient = io.of('/stationClient')
// java后端websocket房间
const serverClient = io.of('/serverClient')

stationClient.on('connection', function (socket) {
  console.log('stationClient connected!')
  socket.on('data', function (data) {
    // 通知java服务端
    serverClient.emit('data', data)
  })
})
serverClient.on('connection', function (socket) {
  console.log('serverClient connected!')
  socket.on('command', function () {

  })
})

server.listen(8080)

// app.listen(8080)

// https test

// const https = require('https')
// var options = {
//     key: fs.readFileSync('./ssl/xxxx.key'),
//     cert: fs.readFileSync('./ssl/xxxx.pem')
// };
// https.createServer(options,app.callback()).listen(8080);
