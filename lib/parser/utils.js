const net = require('net')
const {Socket} = net
// const {models} = require()

function connect (socket, ...args){
    socket.connect(...args)
}

/**
 * 断线重连
 * @param {Socket} socket 
 * @param {Number} time 
 * @param {Array} args 
 * @return 计时器ID 
 */
exports.reconnect = function(socket,time,args){
    // if(!(socket instanceof net.Socket)){
    //     throw TypeError(`socket must be a instance of net.Socket!`)
    // }
    if(typeof time !== 'number'){
        throw TypeError(`time must be a Number,but get ${typeof time}`)
    }
    return setInterval(()=>{
        try{
            console.info('reconnectting...')
            socket.connect(...args)
            // device.start(middleware)

        }catch(err){
            console.error(err)
        }
    },time)
}

