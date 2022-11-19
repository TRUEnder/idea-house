if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const app = express()

// Setting and Middleware
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

app.use(express.static('assets'))


// Database connection

const mongoose = require('mongoose')
const dbName = 'idea-house'
mongoose.connect(process.env.DATABASE_URL, {
    dbName: 'idea-house',
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.pluralize(null)

const db = mongoose.connection
db.on('error', (error) => { console.log(error) })
db.once('open', () => { console.log('Connected to MongoDB') })

// Database Schema
const UserSchema = require('./models/userSchema')
const IdeaSchema = require('./models/ideaSchema')
const ProjectSchema = require('./models/projectSchema')

// Local Passport authentication set up

const initializePassport = require('./config/passport-config')
const passport = initializePassport(
    (email) => { return UserSchema.findOne({ email: email }) },
    (id) => {
        const user = UserSchema.findOne({ _id: id })
        return user
    }
)

// Session Management

const session = require('express-session')
const flash = require('express-flash')
app.use(flash())
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.session())
app.use(passport.initialize())

// Routing middleware

app.use((req, res, next) => {
    console.log(req.isAuthenticated())
    console.log(req.path)
    console.log()
    next()
})

const postRouter = require('./routes/postRouter')
app.use('/post', postRouter)

const usersRouter = require('./routes/usersRouter')
app.use('/users/:id', usersRouter)

const indexRouter = require('./routes/indexRouter')
app.use('/', indexRouter)

// Server configuration

const port = 3000
const server = require('http').Server(app)

const initializeIOServer = require('./config/socket-io-config')
initializeIOServer(server)

server.listen(process.env.PORT | port, () => {
    console.log(`You are listening on http://localhost:${process.env.port} ...`)
})