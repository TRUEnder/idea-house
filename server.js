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
mongoose.connect("mongodb+srv://truender:idea-house10@idea-house.hnojvow.mongodb.net/?retryWrites=true&w=majority", {
    dbName: 'idea-house',
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.pluralize(null)

const db = mongoose.connection
db.on('error', (error) => { console.log(error) })
db.once('open', () => { console.log('Connected to MongoDB') })

// Routing middleware

const mainRouter = require('./routes/main')
app.use('/', mainRouter)

// Listening on port

const port = 3000
app.listen(port, () => {
    console.log(`You are listening on http://localhost:${port} ...`)
})

const server = require('http').Server(app)
const io = require('socket.io')(server)

io.on('connection', (socket) => {
    console.log('new user')
    socket.emit('chat-message', 'Hello World')
})