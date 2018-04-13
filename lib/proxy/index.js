const Koa = require('koa')
// const bodyParser = require('koa-bodyparser')
// const mongoose = require('mongoose')
// const session = require('koa-session')
const http = require('http')
const socketIo = require('socket.io')

let io = null
let server = null

class MeteIOTServer {
  constructor (options = {}) {
    this.koa = new Koa()
    this.koa.keys = options.koaKeys || ['mete-iot-proxy']

    server = http.createServer(this.koa.callback())
    io = socketIo(server)
  }
  listen (port) {
    server.listen(port)
  }
  getIo(){
    return io
  }
  room (name) {
    return io.of(name)
  }
}

module.exports = MeteIOTServer
