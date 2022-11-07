const server = require('./server')
const io = require('socket.io')(server)

io.on('connection', (socket) => {
    socket.on('send-chat-message', (roomId, message) => {
        socket.to(roomId).emit('chat-message', message)
    })
})