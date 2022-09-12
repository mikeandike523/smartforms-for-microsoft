var express = require('express')
var session = require('express-session')
var cors = require('cors')
var path = require('path')
const mongoose = require('mongoose')

require('dotenv').config({ path: path.resolve(__dirname + "/.env") })

var app = express()

app.use(cors({
    origin: true,
    credentials: true,
}))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false // set to true in production
    }
}))

const auth0_router = require('./MicrosoftGraph/auth.js')
app.use('/auth0', auth0_router)

const auth_router = require('./Routes/auth.js')
app.use('/auth', auth_router)

const api_router = require('./Routes/api.js')
app.use('/api', api_router)

const db_router = require('./Routes/dbmgmt.js')
app.use('/db', db_router)

app.get('/dev-redirect', (req, res) => {
    res.redirect('http://localhost:3000')
})

async function connect() {
    await mongoose.connect(process.env.MONGODB_ATLAS_URI)
    console.log("Connected to MongoDB Atlas.")
}

connect().then(() => {

    var server = app.listen(8081, () => {
        console.log('Server running at http://localhost:8081.')
    })

}).catch(console.error)