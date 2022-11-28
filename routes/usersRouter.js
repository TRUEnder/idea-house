const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const methodOverride = require('method-override')
router.use(methodOverride('_method'))

// Database Schema

const UserSchema = require('../models/userSchema')
const IdeaSchema = require('../models/ideaSchema')
const ProjectSchema = require('../models/projectSchema')
const LikeSchema = require('../models/likeSchema')

// Google Cloud Storage for Image
// const bucketName = 'idea-house-image';

// const { Storage } = require('@google-cloud/storage');
// const storage = new Storage({
//     keyFilename: '../peak-bebop-369213-77ec9efb5616.json',
// });


const initializePassport = require('../config/passport-config')
const passport = initializePassport(
    async (email) => { return await UserSchema.findOne({ email: email }) },
    async (id) => { return await UserSchema.findOne({ _id: id }) }
)

// Current user
const { user } = require('../config/currentUser')



// Routing

const blockForNotAuthenticated = require('../config/blockForNotAuthenticated')

router.get('/', blockForNotAuthenticated, async (req, res) => {
    const popularIdeas = await IdeaSchema.find().limit(4)

    const recentIdeas = await IdeaSchema.find().limit(4)

    const popularIdeaAuthor = []
    for (let i = 0; i < 4; i++) {
        let user = await UserSchema.findOne({ _id: popularIdeas[i].author })
        popularIdeaAuthor.push(user.name)
    }
    const recentIdeaAuthor = []
    for (let i = 0; i < 4; i++) {
        let user = await UserSchema.findOne({ _id: recentIdeas[i].author })
        recentIdeaAuthor.push(user.name)
    }

    res.render('users.ejs', { title: 'Idea House', user, popularIdeas, recentIdeas, popularIdeaAuthor, recentIdeaAuthor })
})

router.get('/upload', blockForNotAuthenticated, (req, res) => {
    res.render('upload_idea.ejs', { title: 'Upload Idea', user: req.user })
})

router.get('/notification', blockForNotAuthenticated, (req, res) => {
    res.render('notification.ejs', { title: 'Notification', user: req.user })
})

router.get('/profile', blockForNotAuthenticated, async (req, res) => {
    const followerCount = await UserSchema.countDocuments({ follows: { $all: [user.id] } })

    const posts = await IdeaSchema.find({ _id: { $in: user.ideas } })

    const likedPosts = []
    const likedAuthor = []

    const allLikeFromYou = await LikeSchema.find({ user_id: req.user.id })
    if (allLikeFromYou != null) {
        for (let i = 0; i < allLikeFromYou.length; i++) {
            const idea = await IdeaSchema.findOne({ _id: allLikeFromYou[i].idea_id })
            likedPosts.push(idea)
            const author = await UserSchema.findOne({ _id: allLikeFromYou[i].user_id })
            likedAuthor.push(author)
        }
    }

    res.render('profile.ejs', { title: 'Profile', user, likedPosts, likedAuthor, posts, followerCount })
})

router.get('/timeline', blockForNotAuthenticated, (req, res) => {
    res.render('timeline.ejs', { title: 'Timeline', user: req.user })
})

router.post('/upload', blockForNotAuthenticated, async (req, res) => {
    const now = new Date().toLocaleString('en-GB')

    const idea = new IdeaSchema({
        title: req.body.title,
        author: req.user.id,
        created: now,
        modified: now,
        categories: req.body.category,
        content: req.body.content,
    })

    try {
        await idea.save()

        const ideaInstance = await IdeaSchema.findOne({ title: req.body.title, created: now })
        const changedUser = await UserSchema.findOne({ _id: user.id })
        changedUser.ideas.push(ideaInstance._id)
        await changedUser.save()
        user.ideas = changedUser.ideas

        res.redirect(`/post/${ideaInstance._id}`)
    } catch (e) {
        console.error(e)
    }
})

router.delete('/delete/:postId', blockForNotAuthenticated, async (req, res) => {
    const changedUser = await UserSchema.findOne({ _id: user.id })

    const indexOfIdea = changedUser.ideas.indexOf(req.params.postId)
    if (indexOfIdea > -1) {
        changedUser.ideas.splice(indexOfIdea, 1)
    }

    try {
        await IdeaSchema.deleteOne({ _id: req.params.postId })
        await changedUser.save()
        user.ideas = changedUser.ideas

        console.log('Sucess delete')
        console.log(req.params.postId)
        console.log(changedUser.ideas)

        res.redirect(`/users/${req.user.id}/profile`)
    } catch (error) {
        console.error(error.message)
        res.redirect(`/users/${req.user.id}/profile`)
    }
})

router.post('/follow/profile/:authorId', blockForNotAuthenticated, async (req, res) => {
    const changedUser = await UserSchema.findOne({ _id: user.id })
    changedUser.follows.push(req.params.authorId)

    try {
        await changedUser.save()
        user.follows = changedUser.follows
    } catch (error) {
        console.error(error.message)
    }

    res.redirect(`/public/${req.params.authorId}`)
})

router.post('/unfollow/profile/:authorId', blockForNotAuthenticated, async (req, res) => {
    const changedUser = await UserSchema.findOne({ _id: user.id })
    const indexOfAuthor = changedUser.follows.indexOf(req.params.authorId)
    if (indexOfAuthor > -1) {
        changedUser.follows.splice(indexOfAuthor, 1)
    }

    try {
        await changedUser.save()
        user.follows = changedUser.follows
    } catch (error) {
        console.error(error.message)
    }

    res.redirect(`/public/${req.params.authorId}`)
})

router.post('/follow/:authorid/:postid', blockForNotAuthenticated, async (req, res) => {
    const changedUser = await UserSchema.findOne({ _id: user.id })
    changedUser.follows.push(req.params.authorid)

    try {
        await changedUser.save()
        user.follows = changedUser.follows
    } catch (error) {
        console.error(error.message)
    }

    res.redirect(`/post/${req.params.postid}`)
})

router.post('/unfollow/:authorid/:postid', blockForNotAuthenticated, async (req, res) => {
    const changedUser = await UserSchema.findOne({ _id: user.id })
    const indexOfAuthor = changedUser.follows.indexOf(req.params.authorid)
    if (indexOfAuthor > -1) {
        changedUser.follows.splice(indexOfAuthor, 1)
    }

    try {
        await changedUser.save()
        user.follows = changedUser.follows
    } catch (error) {
        console.error(error.message)
    }

    res.redirect(`/post/${req.params.postid}`)
})

router.get('/chat', blockForNotAuthenticated, async (req, res) => {
    res.render('chat.ejs', { title: 'Chat', user })
})

router.get('/chat/:room', blockForNotAuthenticated, async (req, res) => {
    const target = await UserSchema.findOne({ _id: req.params.room })
    res.render('roomchat.ejs', { title: `Room Chat`, user, roomId: req.params.room, target })
})

router.post('/chat/:room', blockForNotAuthenticated, async (req, res) => {
    // io.emit('send-chat-message', req.params.room, req.body.message)

    res.redirect(`/users/${req.user.id}/chat/${req.params.room}`)
})


// IO Server

// const io = require(./config/socket-io-config)

module.exports = router