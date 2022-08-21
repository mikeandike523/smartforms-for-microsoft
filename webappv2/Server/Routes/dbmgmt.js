const express = require('express')

const mongoose = require('mongoose')

const safeCompare = require("safe-compare")

const Result = require('../Utils/Result.js')

const ConfigLoader = require('../Utils/ConfigLoader.js')

const User = require('../Models/User.js')



const router = express.Router()


MW_checkAdminPassword = function(req, res, next) {
    const db_admin_password = req.body.db_admin_password
    console.log(db_admin_password)
    console.log(req.body)
    if(!safeCompare((db_admin_password??"").trim(),ConfigLoader(['dbmgmt','db_admin_password']))){
        res.json(Result.error("db_admin_password_incorrect","The DB admin password is incorrect."))
        //return next("router")
    }else{
        next()
    }
}

router.use(MW_checkAdminPassword)

router.post("/list-users",async function(req,res){
    try{
        const users = await User.find().exec()
        res.json(users)
    }catch(err){
        res.json(Result.error("mongoose_error","Could not list users: "+err.message))
    }
})

router.post('/clear-all-users',async function(req,res){
    try{
        await User.deleteMany({})
        res.json(Result.success("\"Users\" db successfully cleared."))
    }catch(e){ 
        res.json(Result.error("mongoose_error","Could not clear all users: "+e.message))
    }
})




module.exports = router;