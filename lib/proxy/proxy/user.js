const { StationUser, ServerUser} = require('../models/index')

exports.authPassword = async function (user, password) {
  const rst = await user
    .comparePassword(password)
    .then(isMatch => {
      if (isMatch) {
        return { isMatch, message: '验证成功！' }
      }
      return { isMatch, message: '密码错误！' }
    })
    .catch(err => {
      console.log(err)
      return { isMatch: false, message: '发生了未知错误！' }
    })
  return rst
}

exports.getStationUserByAccount = async function (staionId, account) {
  const doc = await StationUser.findOne({staionId, account})
  return doc
}

exports.stationUserLogin = async function (staionId, account, password) {
  const user = await this.getStationUserByAccount(staionId, account)
  if (!user) return {isMatch: false, message: '没有找到该用户'}
  const rst = await this.authPassword(user, password)
  return rst
}

exports.stationUserRegister = async function (account, password) {
  const doc = new StationUser({account, password})
  const rst = await doc.save().then(data => data)
  return rst
}

exports.getServerUserByAccount = async function (account) {
  const doc = await ServerUser.findOne({account})
  return doc
}

exports.serverUserLogin = async function (account, password) {
  const user = await this.getServerUserByAccount(account)
  if (!user) return {isMatch: false, message: '没有找到该用户'}
  const rst = await this.authPassword(user, password)
  return rst
}

exports.serverUserRegister = async function (account, password) {
  const doc = new ServerUser({account, password})
  const rst = await doc.save().then(data => data)
  return rst
}
