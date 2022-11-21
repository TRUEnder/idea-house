const mongoose = require('mongoose')

const likeSchema = mongoose.Schema({
    user_id: mongoose.SchemaTypes.ObjectId,
    idea_id: mongoose.SchemaTypes.ObjectId
})

module.exports = mongoose.model('like', likeSchema)