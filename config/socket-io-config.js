const socketio = require('socket.io')

function initializeIOServer(server) {
    const io = socketio(server)

    return io
}

module.exports = initializeIOServer