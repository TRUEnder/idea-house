const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
router.use(bodyParser.urlencoded({ extended: false }))

const bcrypt = require('bcrypt')
const methodOverride = require('method-override')
router.use(methodOverride('_method'))

// Database Schema
const UserSchema = require('../models/userSchema')
const IdeaSchema = require('../models/ideaSchema')
const ProjectSchema = require('../models/projectSchema')

const initializePassport = require('../config/passport-config')
const passport = initializePassport(
    async (email) => { return await UserSchema.findOne({ email: email }) },
    async (id) => { return await UserSchema.findOne({ _id: id }) }
)

// Blocking direct access to page for authenticated user only
const blockForAuthenticated = require('../config/blockForAuthenticated')
const blockForNotAuthenticated = require('../config/blockForNotAuthenticated')

// Get User Info
const { getUser } = require('../config/currentUser')

router.get('/', blockForAuthenticated, (req, res) => {
    res.render('index.ejs', { title: 'Idea House' })
})

router.get('/register', blockForAuthenticated, async (req, res) => {
    res.render('register.ejs', { title: 'Register' })
})

router.get('/login', blockForAuthenticated, (req, res) => {
    res.render('login.ejs', { title: 'Login' })
})

router.post('/register', async (req, res) => {
    if (req.body.password !== req.body.password_confirm) {
        res.render('register.ejs', {
            title: 'Register',
            errorMessage: "Password confirmation doesn't match"
        })
    } else {
        const hashedPass = await bcrypt.hash(req.body.password, 10)
        const newUser = new UserSchema({
            name: req.body.name,
            email: req.body.email,
            password: hashedPass
        })

        try {
            await newUser.save()

            getUser(newUser._id).then(() => {
                res.redirect('/login')
            })
        } catch (e) {
            if (e.message.slice(0, 6) == 'E11000') {
                res.render('register.ejs',
                    { title: 'Register', errorMessage: 'Email is already used' })
            } else {
                res.render('register.ejs',
                    { title: 'Register', errorMessage: 'Something went wrong. Please try again.' })
            }
        }
    }
})

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}),
    (req, res) => {
        getUser(req.user.id).then(() => {
            res.redirect(`/users/${req.user._id}/`)
        })
    }
)

router.delete('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(e)
        res.redirect('/')
    })
})

router.get('/what_we_do', (req, res) => {
    res.render('what_we_do.ejs', { title: 'What We Do', req: req });
})

router.get('/register/terms_and_conditions', blockForAuthenticated, (req, res) => {
    res.render('terms_and_conditions.ejs', { title: 'Terms and Conditions' });
})

router.get('/idea_catalog', async (req, res) => {
    const ideas = await IdeaSchema.find()
    const ideasData = []
    for (let i = 0; i < ideas.length; i++) {
        const author = await UserSchema.findOne({ _id: ideas[i].author })
        const ideaData = {
            id: ideas[i]._id,
            title: ideas[i].title,
            authorName: author.name,
            created: ideas[i].created,
            modified: ideas[i].modified,
            label: ideas[i].label,
            categories: ideas[i].categories,
            content: ideas[i].content,
            thumbnail: ideas[i].thumbnail,
            thumbnail_desc: ideas[i].thumbnail_desc,
            like: ideas[i].like,
            views: ideas[i].views,
        }
        ideasData.push(ideaData)
    }

    res.render('idea_catalog.ejs', { title: 'Idea Catalog', req, ideasData })
})

router.use((req, res) => {
    res.statusCode = 404
    res.render('notFound.ejs', { title: '404 - Page not found', req: req })
})


module.exports = router
