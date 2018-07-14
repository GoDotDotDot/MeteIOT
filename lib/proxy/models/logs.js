const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const {ObjectId} = mongoose.SchemaTypes

const LogsSchema = Schema({
  stationId: {
    type: Number
  },
  deviceId: {
    type:Number
  },
  errInfo:{
    type: Object
  }
})
module.exports = mongoose.model('Logs', LogsSchema)
