require('dotenv').config()

var express = require('express')

var session = require('express-session')

var cors = require('cors')

var path = require('path')

const mongoose = require('mongoose')

var app = express()

app.use(cors({origin:"*"}))

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false // set to true in production
    }
}))

var auth0_router = require('./MicrosoftGraph/auth.js')
const { appendFile } = require('fs')

app.use('/auth', auth0_router)

const api_router = require('./Routes/api.js')

app.use('/api', api_router)

app.use(express.static(path.resolve(__dirname + "/../build")))
app.use(express.static(path.resolve(__dirname + "/../build/static")))

app.get('/',(req,res)=>{
    res.sendFile(path.resolve(__dirname+"/../build/index.html"))
})
async function main(){
    await mongoose.connect(process.env.MONGODB_ATLAS_URI)
    var server = app.listen(8081,()=>{
        console.log('Server running at http://localhost:8081.')
    })
}