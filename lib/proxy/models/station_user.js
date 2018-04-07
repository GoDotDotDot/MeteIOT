const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const {ObjectId} = mongoose.SchemaTypes
const StationUserSchema = Schema({
  account: {
    type: String
  },
  password: {
    type: String
  },
  stationId: {
    type: ObjectId
  }
})

// 添加用户保存时中间件对password进行bcrypt加密,这样保证用户密码只有用户本人知道
StationUserSchema.pre('save', function (next) {
  var user = this
  if (user.isModified('password') || user.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err)
      }
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err)
        }
        user.password = hash
        next()
      })
    })
  } else {
    return next()
  }
})
// 校验用户输入密码是否正确
StationUserSchema.methods.comparePassword = function (passw) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(passw, this.password, (err, isMatch) => {
      if (err) {
        reject(err)
      }
      resolve(isMatch)
    })
  })
}

module.exports = mongoose.model('StationUser', StationUserSchema)
