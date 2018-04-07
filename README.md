# MeteIOT Framework

[![npm version](https://img.shields.io/npm/v/meteiot.svg)](https://www.npmjs.com/package/meteiot)[![npm downloads](https://img.shields.io/npm/dw/meteiot.svg)](https://npm-stat.com/charts.html?package=meteiot)[![Github All Releases](https://img.shields.io/github/downloads/godotdotdot/meteiot/total.svg)](https://github.com/GoDotDotDot/MeteIOT/releases)

MeteIOT 是基于`nodejs`开发的一整套物联网数据通信服务框架。它由数据解析、数据传输和数据分发三大模块组成。MeteIOT采用`Websocket`通信协议来提供三方（硬件基础数据提供方、C端和数据服务后端）实时通信服务，`Websocket`采用`socket.io` 2.x版本。

目前MeteIOT包含两个包，分别是`MeteParser`和`MeteProxy`。

**该库暂且用于ECO公司内部使用，代码也是按照公司业务定制化，如果有其他用途，欢迎有志之士前来讨论，打造更通用的框架**

## MeteIOT.MeteParser

MeteParser提供硬件通信服务，基础通信协议为TCP。

### 如何使用

```javascript
const {MeteParser} = require('MeteIOT');
const app = new Parser({
  stationId: '0001' // 站点ID，必传！
})
const io = require('socket.io-client')

const deviceTempreature = require('./device_tempreature')
const middlewareTemperature = require('./middleware_temperature')
const deviceGrating = require('./device_grating')
const middlewareGrating = require('./middleware_grating')

const socket = io('http://127.0.0.1:8080/stationClient', {
  query: {
    stationId: '0001', // 需要提供站点ID给Proxy服务器
    account: 'xzzm', // 用户名
    password: 'xzzm' // 密码
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
```

### 概念

1.设备驱动

   设备驱动用于建立TCP连接，和硬件设备之间进行通信。

2.设备中间件

   设备中间件用于解析设备驱动回传回来的数据，并将该数据传到`Parser.ctx.body`中。

3.中间件

   中间件是`Parser`的中间件，用于处理`Parser.ctx`。在和`MeteIOT.Proxy`通信时，中间件起到了关键作用。

### API

#### Class:Parser(options)

Parser构造函数

parameters:

- options: `<Object>`
  - staionId: `<String>` 站点ID，必传！

return: 返回Parser示例app

#### Parser.prototype.register(device, deviceMiddleware)

parser注册机，用于注册设备驱动和处理设备原始数据的中间件

parameters:

- device: `<Device>` 设备驱动**实例**
- deviceMiddleware: `<DeviceMiddleware>` 设备中间件**对象**

return: void

#### Parser.prototype.use(fn)

parser中间件，用于处理设备中间件回传的数据

parameters:

- fn: `<Function>` 设备中间件回调函数
  - parameters:
    - ctx: `<Context>` app的上下文
    - next: `<Function>`调用next方可继续下一个中间件

return: void

#### Parser.prototype.start()

启动parser实例。

return: void

#### Class:Context

app上下文

#### Context.body: `<Object>`

数据体，用于存放经过设备中间件处理的数据

return: 

```javascript
{
    staionId:'',
    data:{
         [deviceId]: data,
         // ...
     }
}
```



#### Class:MeteParser.Device( port,  address)

设备驱动类构造函数

parameters:

- port: `<Number>` 表示端口
- address: `<String>` 表示连接地址

#### Class:MeteParser.DeviceMiddleware(app, deviceId)

设备中间件

parameters:

- app: `<Parser>` Parser实例
- deviceId: `<String>` 设备ID

#### DeviceMiddleware.prototype.on(event, callback)

用于注册事件，事件和`nodejs` `net.Socket`一致，请参考[new net.Socket([options])](new net.Socket([options]))。这里为了方便，注册**仅支持注册一个**回调函数，请特别注意！

parameters:

- event: `<String>` 事件名称
- callback: `<Function>` 事件回调函数

#### DeviceMiddleware.prototype.remove(event)

移除已监听的事件，这里移除将会移除该事件的所有监听函数

parameters:

- event: `<String>` 事件名称

#### DeviceMiddleware.prototype.getEvent(event)

获取指定事件回调函数

parameters:

- event: `<String>` 事件名称

return: `<Function>` 回调函数

#### DeviceMiddleware.prototype.getAllEvent()

获取所有事件回调函数

return: `<Object>` 所有已注册的事件回调函数

## MeteIOT.MeteProxy

MeteIOT数据分发模块，该模块将会部署在云端

### 如何使用

#### 服务端：

```javascript
const {MeteProxy} = require('MeteIOT')

const server = new MeteProxy()
server.listen(8080)
```

#### 客户端：

##### 数据服务后端

```javascript
const io = require('socket.io-client')
// namespace 必须为/serverClient
const socket = io('xxx/serverClient', {
  // 以下三项查询参数必须提供，否则将会被MeteProxy拒绝连接
  query: {
    serverId: '0001', // 后端服务ID
    account: 'account', // 后端服务账号
    password: 'password' // 后端服务密码
  }
})
// data事件用于接受数据
socket.on('data', function (data) {
  console.log(data)
})
socket.on('error', function (err) {
  console.log(err)
})
socket.on('connect', function (deviceId, command) {
  console.log('connection')
})
```

接受数据：

```javascript
socket.on('data', function (data) {
  console.log(data)
})
```

发送指令

```javascript
socket.emit('command','0001','温度传感器',command)
/*参数说明
* 1. 事件名称
* 2. 站点ID
* 3. 指令
*/
```

##### C端

```javascript
// namespace 必须为/frontEndClient
const socket = io('/frontEndClient')
// C端不需要提供用户名密码，MeteProxy将会根据握手包获取IncommingMessage，从中获取cookie，从而从验证接口验证session
 socket.on('data', function (data) {
      
  })
```

接受数据：

```javascript
socket.on('data', function (data) {
  console.log(data)
})
```

发送指令

```javascript
发送指令请和后端联系
```

##### 硬件基础数据提供方

```javascript
const io = require('socket.io-client')
// namespace 必须为/stationClient
const socket = io('xxx/stationClient', {
  query: {
    stationId: '0001', // 站点ID
    account: 'xzzm', // 站点账号
    password: 'xzzm' // 站点密码
  }
})
socket.on('data', function (err) {
  console.log(err)
})
socket.on('error', function (err) {
  console.log(err)
})
socket.on('connect', function () {
  console.log('connection')
})

```

接受指令：

```javascript
socket.on('command', function (data) {
  console.log(data)
})
```

发送数据：

发送数据请通过MeteParser中间件获取数据，然后通过socket.io websocket库进行发送。示例代码如下：

```javascript
app.use((ctx, next) => {
  const { body } = ctx
  socket.emit('data', body)
})
```


### API

#### Class: MeteProxy(options)

MeteProxy构造函数

parameters:

- options: `<Object>`

```javascript
{
    dbstr:'数据库连接字符串`mongodb://account:${encodeURIComponent('password')}@iot.example.com/meteiot`',
    session: {
      key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
        /** (number || 'session') maxAge in ms (default is 1 days) */
        /** 'session' will result in a cookie that expires when session/browser is closed */
        /** Warning: If a session cookie is stolen, this cookie will never expire */
      maxAge: 86400000,
      overwrite: true, /** (boolean) can overwrite or not (default true) */
      httpOnly: true, /** (boolean) httpOnly or not (default true) */
      signed: true, /** (boolean) signed or not (default true) */
      rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
      renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false) */
      store: new SessionStore()
	} // 默认session配置
}
```



return:void

#### MeteProxy.koa

koa 2.x实例，可用于拓展开发

return: koa 实例

#### MeteProxy.prototype.listen(port)

开启MeteProxy分发服务

parameters:

- port: `<Number>` 监听端口

#### 备注

MeteProxy内部已使用Koa 2.x，koa keys为`mete-iot-proxy`，内部已使用的中间件如下所示：

- koa-session
- koa-bodyparser
- mongodb

如需拓展web页面，可通过MeteProxy.koa来进行二次开发。

## LICENCE

MIT License

Copyright (c) 2018 KUI CHU

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

