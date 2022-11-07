const { io } = require('socket.io-client')
const socket = io('http://localhost:3000')

const messageContainer = document.getElementById('chat-texts')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input').value

function appendMessage(message) {
    const chat = document.createElement('p')
    chat.className("chat-message")
    chat.innerHTML = message
    messageContainer.append(chat)
}

socket.on('chat-message', message => {
    appendMessage(message)
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = messageInput;
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', roomId, message)
})