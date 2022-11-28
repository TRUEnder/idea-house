const UserSchema = require('../models/userSchema')
const user = {
    _id: null,
    name: null,
    email: null,
    follows: [],
    ideas: [],
    projects: []
};

async function getUser(id) {
    const result = await UserSchema.findOne({ _id: id })
    user.id = result._id
    user.name = result.name
    user.email = result.email
    user.follows = result.follows
    user.ideas = result.ideas
    user.projects = result.projects

    return user
}

module.exports = { getUser, user }