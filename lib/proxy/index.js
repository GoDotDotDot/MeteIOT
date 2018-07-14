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
let serverClientStatus = false
class MeteIOTServer {
  constructor (options = {}) {
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
  // initSocket () {
  //   const _stationClient = this.room('/stationClient')
  //   const _serverClient = this.room('/serverClient')
  //   const _frontEndClient = this.room('/frontEndClient')

  //   _stationClient.use(async(socket, next) => {
  //     const {account, password, stationName} = socket.handshake.query
  //     const rst = await proxy.user.stationUserLogin(stationName, account, password)
  //     if (rst.isMatch) return next()
  //     socket.disconnect(true)
  //     next(new Error(rst.message))
  //   })
  //   /**
  //    * TODO:
  //    * 前端验证走session，调用前端登录验证接口
  //    * 从socket中获取request的cookie 然后传递给前端验证接口
  //    */
  //   _frontEndClient.on('connection', function (socket) {
  //     console.log(`frontEndClient connected!`)
  //     /**
  //      * TODO:
  //      * 需要根据前端请求头的cookie去数据库查询用户所属的站点id来作为room号
  //      * 前端第一次连接需要向java后端发送指令获取最新的数据，以免前端必须等站点服务器上传数据才会显示
  //      */
  //     socket.on('join room', (room) => {
  //       socket.join(room)
  //     })
  //     socket.on('disconnect', (room) => {
  //       console.log(`frontEndClient disconnected!`)
  //       socket.leave(room)
  //     })
  //     // 以下为发送命令测试代码
  //     socket.on('command', function (staionId, deviceId, command) {
  //       _stationClient.to(staionId).emit('command', deviceId, command)
  //     })
  //   })
  //   /**
  //    * TODO:
  //    * 需要加中间件做认证
  //    */

  //   _stationClient.on('connection', function (socket) {
  //     const {stationName} = socket.handshake.query
  //     socket.join(stationName)
  //     console.log(stationName + 'stationClient connected!')
  //     socket.on('data', function (data) {
  //       // 通知java服务端
  //       const {stationName} = data         
  //       if(!serverClientStatus){
  //         // 离线存储
  //         proxy.offLineStoreProxy.insertOffLineData(stationName,data) 
  //       }else{

  //       }
  //       // java服务端断开后可以尝试触发事件
  //       _serverClient.emit('data', data)
  //       // 发送给前端
  //       _frontEndClient.to(stationName).emit('data', data)
  //     })
  //     socket.on('disconnect', (reason) => {
  //       console.log(stationName + 'stationClient disconnected!')
  //     // ...
  //     })
  //     socket.on('offlineData',(data)=>{
  //       if(serverClientStatus){
  //         _serverClient.emit('offlineData', data)
  //       }else{
  //         // 存储在本地
  //         proxy.offLineStoreProxy.insertManyOffLineData(stationName,data)
  //       }
  //     })
  //   })
  //   _serverClient.on('connection',async function (socket) {
  //     console.log('serverClient connected!')
  //     serverClientStatus = true      
  //     // 发送离线数据
      
  //     socket.on('command', function (staionId, deviceId, command) {
  //       _stationClient.to(staionId).emit('command', deviceId, command)
  //     })
  //     socket.on('disconnect', (reason) => {
  //       // 需要离线存储数据
  //       serverClientStatus = false
  //       console.log('serverClient disconnect!')
  //     })
  //     const data = await proxy.offLineStoreProxy.getLocalOffLineData() 
  //     console.log(data)
  //     _serverClient.emit('offlineData', data)
      
  //   })
  // }
  listen (port) {
    server.listen(port)
  }
  room (name) {
    return io.of(name)
  }
}

module.exports = MeteIOTServer
