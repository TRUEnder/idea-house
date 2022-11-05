const app = require('./server')
const io = require('socket.io')(app)

io.on('connection', (socket) => {
    socket.emit('chat-message', 'Hello World')
})