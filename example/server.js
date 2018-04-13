const {MeteProxy} = require('meteiot')
const app = new MeteProxy()

const stationClient = app.room('/stationClient')
app.koa.use(router.routes()).use(router.allowedMethods())

stationClient.on('connection', function (socket) {
  socket.on('data', function (data) {
    console.log(data)
  })
})

app.listen(8080)
