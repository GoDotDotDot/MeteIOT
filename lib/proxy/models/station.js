const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const {ObjectId} = mongoose.SchemaTypes

const StationSchema = Schema({
  stationId: {
    type: Number
  }
})
module.exports = mongoose.model('Station', StationSchema)
