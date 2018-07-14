const Router = require('koa-router')
const route = new Router()
const proxy = require('./proxy')
const fs = require('fs')
const html = fs.readFileSync(`${__dirname}/index.html`)
const html0002 = fs.readFileSync(`${__dirname}/index.0002.html`)
const server = fs.readFileSync(`${__dirname}/server.html`)

route.get('/', (ctx, next) => {
  ctx.type = 'text/html; charset=utf-8'
  ctx.body = html
  next()
})
route.get('/s0002', (ctx, next) => {
  ctx.type = 'text/html; charset=utf-8'
  ctx.body = html0002
  next()
})
route.get('/server', (ctx, next) => {
  ctx.type = 'text/html; charset=utf-8'
  ctx.body = server
  next()
})
route.get('/register', (ctx, next) => {
  ctx.type = 'text/html; charset=utf-8'
  const {account, password} = ctx.request.query
  const doc = proxy.user.stationUserRegister(account, password)
  ctx.body = doc.toString()
  next()
})
route.get('/serverClient', (ctx, next) => {
  ctx.type = 'text/plain; charset=utf-8'
  ctx.body = '请使用Websocket协议连接！'
  next()
})
module.exports = route
