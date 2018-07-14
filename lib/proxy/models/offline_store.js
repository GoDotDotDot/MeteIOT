const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const {ObjectId} = mongoose.SchemaTypes

const OffLineStoreSchema = Schema({
  stationName: {
    type: String
  },
  data: {
    type: Object
  },
  is_local: {
    type: Boolean,
    default: true
  }
})
module.exports = mongoose.model('OffLineStore', OffLineStoreSchema)
