const io = require('socket.io-client')

const socket = io('http://127.0.0.1:8080/stationClient', {
  query: {
    stationId: '0001',
    account: 'xzzm',
    password: 'xzzm'
  }
})

socket.on('error', function (err) {
  console.log(err)
})
socket.on('connect', function (deviceId, command) {
  console.log('connection')
})
