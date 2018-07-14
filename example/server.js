const {MeteProxy} = require('../index')

const server = new MeteProxy({dbstr: `mongodb://meteiot:${encodeURIComponent('meteiot')}@meteiot.meteiot.meteiot/meteiot`})

server.listen(8080)
