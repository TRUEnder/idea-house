const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

// Database Schema

const UserSchema = require('../models/userSchema')
const IdeaSchema = require('../models/ideaSchema')
const ProjectSchema = require('../models/projectSchema')

const initializePassport = require('../config/passport-config')
const passport = initializePassport(
    async (email) => { return await UserSchema.findOne({ email: email }) },
    async (id) => { return await UserSchema.findOne({ _id: id }) }
)

// Routing

const blockForNotAuthenticated = require('../config/blockForNotAuthenticated')

router.get('/', blockForNotAuthenticated, (req, res) => {
    res.render('users.ejs', { title: 'Idea House', user: req.user })
})

router.get('/upload', blockForNotAuthenticated, (req, res) => {
    res.render('upload_idea.ejs', { title: 'Upload Idea', user: req.user })
})

router.get('/notification', blockForNotAuthenticated, (req, res) => {
    res.render('notification.ejs', { title: 'Notification', user: req.user })
})

router.get('/profile', blockForNotAuthenticated, async (req, res) => {
    const user = await UserSchema.findOne({ _id: req.user.id })
    const posts = await IdeaSchema.find({ _id: { $in: user.ideas } })
    const userFollower = await UserSchema.find({ follows: { $all: [user._id] } })
    const followerCount = userFollower.length;

    res.render('profile.ejs', { title: 'Profile', user, posts, followerCount })
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
        const user = await UserSchema.findOne({ _id: req.user.id })
        user.ideas.push(ideaInstance._id)
        await user.save()

        res.redirect(`/post/${ideaInstance._id}`)
    } catch (e) {
        console.error(e)
    }
})

router.post('/follow/:authorid/:postid', blockForNotAuthenticated, async (req, res) => {
    const user = await UserSchema.findOne({ _id: req.user.id })
    user.follows.push(req.params.authorid)
    await user.save()

    res.redirect(`/post/${req.params.postid}`)
})

router.post('/unfollow/:authorid/:postid', blockForNotAuthenticated, async (req, res) => {
    const user = await UserSchema.findOne({ _id: req.user.id })

    const indexOfAuthor = user.follows.indexOf(req.params.authorid)
    if (indexOfAuthor > -1) {
        user.follows.splice(indexOfAuthor, 1)
    }
    user.save()

    res.redirect(`/post/${req.params.postid}`)
})

router.get('/chat', blockForNotAuthenticated, async (req, res) => {
    const user = await UserSchema.findOne({ _id: req.user.id })
    res.render('chat.ejs', { title: 'Chat', user })
})

router.get('/chat/:room', blockForNotAuthenticated, async (req, res) => {
    const user = await UserSchema.findOne({ _id: req.user.id })
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