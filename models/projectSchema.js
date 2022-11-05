const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true
    },
    created: {
        type: String,
        require: true
    },
    modified: {
        type: String,
        require: true
    },
    label: {
        type: String,
        require: true
    },
    category: {
        type: [String],
        require: true
    },
    content: {
        type: String,
        require: true
    },
    thumbnail: {
        type: Buffer
    },
    thumbnail_desc: {
        type: String
    },
    like: {
        type: Number,
        require: true
    },
    views: {
        type: Number,
        require: true
    }
})


module.exports = mongoose.model('project', projectSchema)