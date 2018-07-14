const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {ObjectId} = mongoose.SchemaTypes
// 暂时弃用该表
const SocketSchema = Schema({
  stationId: {
    type: ObjectId
  },
  serverId: {
    type: ObjectId
  },
  socketId: {
    type: String
  }
})
module.exports = mongoose.model('Socket', SocketSchema)
