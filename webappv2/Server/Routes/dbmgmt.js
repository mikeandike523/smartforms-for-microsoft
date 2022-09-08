const express = require('express')
const mongoose = require('mongoose')
const safeCompare = require("safe-compare")
const Result = require('../Utils/Result.js')
const ConfigLoader = require('../Utils/ConfigLoader.js')
const User = require('../Models/User.js')
const UserData = require('../Models/UserData.js')
const ConnectedAccount = require('../Models/ConnectedAccount.js')
const router = express.Router()

MW_checkAdminPassword = function(req, res, next) {
    const db_admin_password = req.body.db_admin_password
    if(!safeCompare((db_admin_password??"").trim(),ConfigLoader(['dbmgmt','db_admin_password']))){
        res.json(Result.error("db_admin_password_incorrect","The DB admin password is incorrect."))
    }else{
        next()
    }
}

router.use(MW_checkAdminPassword)

router.post("/list-users",async function(req,res){
    try{
        const users = await User.find().exec()
        res.json(Result.success(users))
    }catch(err){
        res.json(Result.error("mongoose_error","Could not list users: "+err.message))
    }
})

router.post('/clear-all-users',async function(req,res){
    try{
        await User.deleteMany({})
        await UserData.deleteMany({})
        await ConnectedAccount.deleteMany({})
        
        res.json(Result.success("\"Users\" db successfully cleared."))
    }catch(e){ 
        res.json(Result.error("mongoose_error","Could not clear all users: "+e.message))
    }
})

router.post('/list-user-data', async function(req,res){

    try{
        
        const userDataResults = []

        const users = await User.find().exec()

        for(let i = 0; i < users.length; i++){

            const user = users[i]

            var resultObj = {}

            // const userData = await UserData.findOne({user:user.id}).populate('connectedAccounts').exec()

            resultObj["user"] = user;
            // resultObj["userData"] = userData;

            // var connectedAccounts = userData["connectedAccounts"]

            // var array = []

            // for(var j=0; j<connectedAccounts.length; j++){
            //     connectedAccount = connectedAccounts[j]
            //     array.push(connectedAccount)
            // }

            // resultObj["connectedAccounts"] = array;

            userDataResults.push(resultObj)
            
        }

        res.json(Result.success(userDataResults))

    }catch(e){
        res.json(Result.error("mongoose error","Could not list user data: "+e.message))
    }

})

router.post('/list-connected-accounts',async (req,res)=>{

    try{
        const connectedAccounts = await ConnectedAccount.find({}).exec()
        res.json(Result.success(connectedAccounts))
    }
    catch(e){
        res.json(Result.error("generic_error","Could not list connected accounts: "+e.message))
    }
})

module.exports = router;