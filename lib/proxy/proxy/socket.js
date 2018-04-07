const {socket} = require('../models/index')

const Socket = socket

exports.insertSocket = function (socketId, stationId, serverId) {
  const doc = new Socket({socketId, stationId, serverId})
  return doc
}
