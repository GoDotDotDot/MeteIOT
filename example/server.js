const {MeteProxy} = require('../index')

const server = new MeteProxy({dbstr: `mongodb://account:${encodeURIComponent('password')}@iot.example.com/meteiot`})

server.listen(8080)
