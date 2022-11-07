const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    users: {
        type: [String]
    }
})

module.exports = mongoose.model('room', roomSchema)