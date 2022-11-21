const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))

// Database Stuff
const UserSchema = require('../models/userSchema')
const IdeaSchema = require('../models/ideaSchema')
const ProjectSchema = require('../models/projectSchema')
const LikeSchema = require('../models/likeSchema')

const initializePassport = require('../config/passport-config')
const passport = initializePassport(
    async (email) => { return await UserSchema.findOne({ email: email }) },
    async (id) => { return await UserSchema.findOne({ _id: id }) }
)

const { user } = require('../config/currentUser')

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
        if (user.follows != null) {
            hasFollow = user.follows.includes(author._id)
        }
    }

    let hasLike = false
    if (req.isAuthenticated()) {
        const allLikeFromYou = await LikeSchema.find({ user_id: req.user.id })
        if (allLikeFromYou != null) {
            for (let i = 0; i < allLikeFromYou.length; i++) {
                if (allLikeFromYou[i].idea_id.valueOf() == post._id.valueOf()) {
                    hasLike = true
                    break
                }
            }
        }
    }

    res.render('post.ejs', {
        title: post.title,
        req,
        post,
        author,
        hasFollow,
        hasLike,
        followerCount,
        suggestedPosts
    })
})

router.post('/:id/like', async (req, res) => {
    if (req.body.hasLike === 'false') {
        const like = new LikeSchema({
            user_id: req.user.id,
            idea_id: req.params.id
        })
        await like.save()

        const post = await IdeaSchema.findOne({ _id: req.params.id })
        post.like++
        await post.save()

    } else {

        await LikeSchema.deleteOne({ $and: [{ user_id: req.user.id }, { idea_id: req.params.id }] })

        const post = await IdeaSchema.findOne({ _id: req.params.id })
        post.like--
        await post.save()
    }

    res.redirect(`/post/${req.params.id}`)
})

module.exports = router