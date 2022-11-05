const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const blockForAuthenticated = require('../config/blockForAuthenticated')
const blockForNotAuthenticated = require('../config/blockForNotAuthenticated')

router.get('/:id', blockForNotAuthenticated, (req, res) => {
    res.render('users.ejs', { title: 'Idea House', user: req.user })
})

router.get('/:id/chat', (req, res) => {
    res.render('chat.ejs', { title: 'Chat' })
})

router.get('/:id/chat/:room', blockForNotAuthenticated, (req, res) => {
    res.render('room.ejs', { title: `Room Chat` })
})

router.get('/:id/test', (req, res) => {
    console.log(req.user.name)
    res.send('TEST')
})

module.exports = router