const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {ObjectId} = mongoose.SchemaTypes

const ServerUserSchema = Schema({
  account: {
    type: String
  },
  password: {
    type: String
  },
  serverId: {
    type: ObjectId
  }
})

module.exports = mongoose.model('ServerUser', ServerUserSchema)
