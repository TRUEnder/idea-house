const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))

// Database Stuff
const UserSchema = require('../models/userSchema')
const IdeaSchema = require('../models/ideaSchema')
const ProjectSchema = require('../models/projectSchema')

const initializePassport = require('../config/passport-config')
const passport = initializePassport(
    async (email) => { return await UserSchema.findOne({ email: email }) },
    async (id) => { return await UserSchema.findOne({ _id: id }) }
)

// Routing

router.get('/:id', async (req, res) => {
    const post = await IdeaSchema.findOne({ _id: req.params.id })
    post.views++
    post.save()

    const author = await UserSchema.findOne({ _id: post.author })

    const authorFollower = await UserSchema.find({ follows: { $all: [author._id] } })
    const followerCount = authorFollower.length;

    const relatedPost = await IdeaSchema.find({ categories: { $all: post.categories[0] } }).limit(3)

    const suggestedPosts = []
    for (let i = 0; i < relatedPost.length; i++) {
        const relatedAuthor = await UserSchema.findOne({ _id: relatedPost[i].author })
        suggestedPosts.push({
            id: relatedPost[i]._id,
            title: relatedPost[i].title,
            author: relatedAuthor.name
        })
    }

    let hasFollow = false
    if (req.isAuthenticated()) {
        const user = await UserSchema.findOne({ _id: req.user.id })
        if (user.follows != null) {
            hasFollow = user.follows.includes(author._id)
        }
    }

    res.render('post.ejs', {
        title: post.title,
        req,
        post,
        author,
        hasFollow,
        followerCount,
        suggestedPosts
    })
})

module.exports = router