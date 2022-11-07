const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    follows: {
        type: [mongoose.SchemaTypes.ObjectId]
    },
    ideas: {
        type: [mongoose.SchemaTypes.ObjectId]
    },
    projects: {
        type: [mongoose.SchemaTypes.ObjectId]
    }
})

module.exports = mongoose.model('user', userSchema)