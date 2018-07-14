const models = require('../models')
const { OffLineStore } = models

/**
 * 插入日志（本地）
 * @param {Number} stationName
 * @param {String} deviceId
 * @param {String} type
 * @param {Object} info
 */
exports.insertOffLineData = async function (stationName, data) {
  const doc = new OffLineStore({stationName, data})
  const res = await doc.save().then(() => {
    return {status: true, message: '本地存储数据成功！'}
  }).catch(err => {
    return {status: false, message: err}
  })
  return res
}
exports.insertManyOffLineData = async function (stationName, data) {
  const res = await OffLineStore.insertMany(data).then(docs=>{
    return {status: true, message: '本地存储数据成功！'}
  }).catch(err=>{
    return {status: false, message: '本地存储数据失败！'}
    
  })
  return res
}

exports.getLocalOffLineData = async function () {
  try {
    const doc = OffLineStore.find({is_local: true})
    const dt = await doc.exec()
    await doc.updateMany({is_local: false})
    return dt
  } catch (error) {
    console.log(error)
  }

  // const promise = await doc.updateMany({is_local: false}).exec().then(d => {
  //   return d
  // })
}
