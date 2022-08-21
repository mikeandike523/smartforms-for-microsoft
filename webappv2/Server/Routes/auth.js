const express = require('express')

const mongoose = require('mongoose')

const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')

const Result = require("../Utils/Result.js")

const User = require('../Models/User.js')

const router = express.Router()

// MW = Middleware
// RT = Route
async function RT_createUser(req,res,next){
    console.log(req.body)
    try{
        const userExists = await User.exists({email:req.body.email}) //Throws?
        if(userExists){
            res.json(Result.error("user_exists","A user already exists with the given email."))
            return
        }
    }
    catch(e){
        console.log(e)
        console.log(e.message)
        res.json(Result.error("mongoose_error", "Error checking for existing user: " + e.message))
        return
    }
    User({
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password,8)
    }).save((err,user)=>{
        if(err){
            res.json(Result.error("mongoose_error","Error creating user: "+err.message))
        }else{
            res.json(Result.success("User created successfully."))
        }
    })
}

router.post('/signup',RT_createUser)

module.exports = router