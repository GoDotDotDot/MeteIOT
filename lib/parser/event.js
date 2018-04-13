const EventEmitter = require('events')

class MeteIOTEvent extends EventEmitter {

}
const MeteIOTEventInstance = new MeteIOTEvent()
MeteIOTEventInstance.on('data', function () {

})

module.exports = MeteIOTEventInstance
