const express = require('express')

const mongoose = require('mongoose')

const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')

const Result = require("../Utils/Result.js")

const User = require('../Models/User.js')

const router = express.Router()

// MW = Middleware
// RT = Route
function RT_createUser(req,res,next){
    User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password,8)
    }).save((err,user)=>{
        if(err){
            res.json(Result.error("generic_error","Error creating user: "+JSON.stringify(err)).obj())
        }else{
            res.json(Result.success("User created successfully.").obj())
        }
    })
}

router.post('/signup',RT_createUser)

module.exports = router