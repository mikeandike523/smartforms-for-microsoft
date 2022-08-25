const express = require('express')

const mongoose = require('mongoose')

const jwt = require('jsonwebtoken')

const bcrypt = require('bcryptjs')

const Result = require("../Utils/Result.js")

const ConfigLoader = require('../Utils/ConfigLoader.js')

const User = require('../Models/User.js')

const UserData = require('../Models/UserData.js')

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

            UserData({
                "user":user.id
            }).save((err, userData)=>{

                if(err){
                    res.json(Result.error("mongoose_error","Error saving UserData object: "+err.message))
                }else{
                    res.json(Result.success("User created successfully."))
                }

            })
            
        }
    })

}

async function RT_signin(req,res){
    const email=req.body.email;
    const password = req.body.password;
    try{
        const user = await User.findOne({email:email})
        if(!user){
            res.json(Result.error("user_nonexistent","A user with the supplied email does not exist."))
            return
        }
        const passwordIsCorrect = bcrypt.compareSync(password,user.password)
        if(!passwordIsCorrect){
            res.json(Result.error("password_incorrect","Password is incorrect."))
            return
        }
    
        const secret_key = ConfigLoader(["jwt","secret_key"])

        res.json(Result.success(jwt.sign({
            id: user.id, email:user.email
        },secret_key,{
            expiresIn:86400 //24 hours
        })))

    }catch(e){
        res.json(Result.error("mongoose_error", "Error checking for existing user: " + e.message))
        return
    }
}

router.post('/signup',RT_createUser)

router.post('/signin',RT_signin)

module.exports = router