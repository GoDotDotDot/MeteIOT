const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const mongoose = require('mongoose')
const session = require('koa-session')
const http = require('http')
const socketIo = require('socket.io')
const _ = require('lodash')
const session_config = require('./config/session.config')
const router = require('./router')
const proxy = require('./proxy')

let io = null
let server = null

class MeteIOTServer {
  constructor (options = {}) {
    // 初始化mongodb配置
    if (options.dbstr) {
      mongoose.connect(
        options.dbstr,
        { autoIndex: false },
        (err, connection) => {
          if (err) throw Error(err)
        }
      )
    } else {
      console.warn('mongodb connectiong string not provide!')
    }

    this.koa = new Koa()
    this.koa.keys = ['mete-iot-proxy']
    this.koa.use(session(_.merge(session_config, options.session), this.koa))
    this.koa.use(bodyParser())

    server = http.createServer(this.koa.callback())
    io = socketIo(server)
    /**
     * TODO:
     * 测试使用，正式版本请移除 this.koa.use(router.routes()).use(router.allowedMethods())
     */
    this.koa.use(router.routes()).use(router.allowedMethods())
  }
  initSocket () {
    const _stationClient = this._room('/stationClient')
    const _serverClient = this._room('/serverClient')
    const _frontEndClient = this._room('/frontEndClient')

    _stationClient.use(async(socket, next) => {
      const {account, password, staionId} = socket.handshake.query
      const rst = await proxy.user.stationUserLogin(staionId, account, password)
      if (rst.isMatch) return next()
      next(new Error(rst.message))
    })
    /**
     * TODO:
     * 前端验证走session，调用前端登录验证接口
     * 从socket中获取request的cookie 然后传递给前端验证接口
     */
    _frontEndClient.on('connection', function (socket) {
      console.log(`frontEndClient connected!`)
      /**
       * TODO:
       * 需要根据前端请求头的cookie去数据库查询用户所属的站点id来作为room号
       */
      socket.on('join room', (room) => {
        socket.join(room)
      })
      socket.on('disconnect', (room) => {
        console.log(`frontEndClient disconnected!`)
        socket.leave(room)
      })
      // 以下为发送命令测试代码
      socket.on('command', function (staionId, deviceId, command) {
        _stationClient.to(staionId).emit('command', deviceId, command)
      })
    })
    /**
     * TODO:
     * 需要加中间件做认证
     */

    _stationClient.on('connection', function (socket) {
      const {stationId} = socket.handshake.query
      socket.join(stationId)
      console.log(stationId + 'stationClient connected!')
      socket.on('data', function (data) {
          // 通知java服务端
        _serverClient.emit('data', data)
        const {stationId} = data
        // 发送给前端
        _frontEndClient.to(stationId).emit('data', data)
      })
      socket.on('disconnect', (reason) => {
        console.log(stationId + 'stationClient disconnected!')
      // ...
      })
    })
    _serverClient.on('connection', function (socket) {
      console.log('serverClient connected!')
      socket.on('command', function (staionId, deviceId, command) {
        _stationClient.to(staionId).emit('command', deviceId, command)
      })
      socket.on('disconnect', (reason) => {
        // ...
        console.log('serverClient disconnect!')
      })
    })
  }
  listen (port) {
    this.initSocket()
    server.listen(port)
  }
  _room (name) {
    return io.of(name)
  }
}

module.exports = MeteIOTServer
