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
    const hashedPass = await bcrypt.hash(req.body.password, 10)
    const user = new UserSchema({
        name: req.body.name,
        email: req.body.email,
        password: hashedPass
    })

    try {
        await user.save()
        res.redirect('/register/terms_and_conditions')
    } catch {
        res.render('register.ejs',
            { title: 'Register', errorMessage: 'Something went wrong. Please try again.' })
    }
})

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}),
    (req, res) => {
        res.redirect(`/users/${req.user.id}`)
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

// TESTING PURPOSE

router.get('/alluser', async (req, res) => {
    console.log(req.user.name)
    try {
        const users = await UserSchema.find()
        res.render('testing/allUsers.ejs', { title: 'All User', users: users })
    } catch {
        res.send('Something is wrong. Try again')
    }
})
router.get('/allidea', async (req, res) => {
    try {
        const ideas = await IdeaSchema.find()
        res.render('testing/allIdeas.ejs', { title: 'All Idea', ideas: ideas })
    } catch {
        res.send('Something is wrong. Try again')
    }
})
router.get('/allproject', async (req, res) => {
    try {
        const projects = await ProjectSchema.find()
        res.render('testing/allProjects.ejs', { title: 'All User', projects: projects })
    } catch {
        res.send('Something is wrong. Try again')
    }
})
//

router.use((req, res) => {
    res.statusCode = 404
    res.render('notFound.ejs', { title: '404 - Page not found', req: req })
})


module.exports = router
