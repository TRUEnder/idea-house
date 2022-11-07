const io = require('socket.io')

function initializeIOServer(server) {
    return io(server)
}

module.exports = initializeIOServer