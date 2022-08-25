require('dotenv').config()

var express = require('express')

var session = require('express-session')

var cors = require('cors')

var path = require('path')

const mongoose = require('mongoose')

var app = express()

// app.use(cors({
//     origin:"http://localhost:3000",
//     credentials: true,
//     preflightContinue: true
// }))

app.use(cors({
    origin:true,
    credentials: true,
}))

app.use(express.json())

app.use(express.urlencoded({extended:true}))

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false // set to true in production
    }
}))

var auth0_router = require('./MicrosoftGraph/auth.js')

app.use('/auth0', auth0_router)

const auth_router = require('./Routes/auth.js')

app.use('/auth',auth_router)

const api_router = require('./Routes/api.js')

app.use('/api', api_router)

const db_router = require('./Routes/dbmgmt.js')

app.use('/db',db_router)

app.use(express.static(path.resolve(__dirname + "/../Client/build")))
app.use(express.static(path.resolve(__dirname + "/../Client/build/static")))

app.get('/',(req,res)=>{
    res.sendFile(path.resolve(__dirname+"/../Client/build/index.html"))
})

app.get('/dev-redirect',(req,res)=>{
    res.redirect('http://localhost:3000')
})

async function connect(){
    await mongoose.connect(process.env.MONGODB_ATLAS_URI)
    console.log("Connected to MongoDB Atlas.")

}
connect().then(()=>{

    var server = app.listen(8081,()=>{
        console.log('Server running at http://localhost:8081.')
    })

}).catch(console.error)