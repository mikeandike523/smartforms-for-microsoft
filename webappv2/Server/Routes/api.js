const express = require('express');

const jwt = require('jsonwebtoken')

const Result = require('../Utils/Result.js')

const ConfigLoader = require('../Utils/ConfigLoader');

const UserData = require('../Models/UserData.js')

const {graph_get, graph_post} = require('../MicrosoftGraph/fetch.js') 

const router = express.Router();

const MW_verifyToken = (req,res,next) => {

     const token = req.body.jwt;
     const secret = ConfigLoader(["jwt","secret_key"])

     if(!token){
        res.status(403).json(Result.error("jwt_missing","No jwt token was included with this request."))
        return
     }

     jwt.verify(token,secret, (err, decoded)=>{

        if(err){
            res.status(401).json(Result.error("jwt_invalid","Invalid jwt token. Please sign-out and sign-in again."))
        }else{
            req.userId = decoded.id
            next()
        }

     })
}

router.use(MW_verifyToken)

async function checkConnectionHealth(microsoftId,accessToken,refreshToken){
    // const response = await graph_get('/me',accessToken)
    // return JSON.stringify(response)
    return "alive"
}

router.post('/associate-latest-token',async (req,res) => {
    console.log("Found session: "+req.session)
    console.log("Found tokenInfo: "+req.session.tokenInfo)
    console.log(req.session)
    if((!req.session)||(!req.session.tokenInfo)){
        res.status(200).json(Result.success("No pending tokens to associate."))
    }else{
        const tokenInfo = req.session.tokenInfo
        const userId = req.userId;
        const userData = await UserData.findOne({user:userId})
        const connectedAccounts = userData.connectedAccounts
        var accountExists = false
        var foundAccount = -1
        for(var i=0; i<connectedAccounts.length; i++){
            if(connectedAccounts[i].microsoftId == tokenInfo.microsoftId){
                accountExists = true
                foundAccount = i
                break
            }
        }

        if(accountExists){
            connectedAccounts[foundAccount].microsoftId = tokenInfo.microsoftId
            connectedAccounts[foundAccount].userFullName = tokenInfo.userFullName
            connectedAccounts[foundAccount].microsoftEmail = tokenInfo.microsoftEmail
            connectedAccounts[foundAccount].accessTojen = tokenInfo.accessToken
            connectedAccounts[foundAccount].refreshToken = tokenInfo.refreshToken
            connectedAccounts[foundAccount].organizationName = tokenInfo.organizationName
        }else{
            connectedAccounts.push(tokenInfo)
        }

        await UserData.findOneAndUpdate({user:req.userId},{connectedAccounts:connectedAccounts})

        res.status(200).json("Microsoft account successfully linked.")

    }
})

router.post('/connected-accounts',async (req,res)=>{
    try{
        const userData = await UserData.findOne({"user":req.userId}).exec()
        const connectedAccounts = userData.connectedAccounts;
        for(var connectedAccount in connectedAccounts){
            connectedAccount["health"] = await checkConnectionHealth(connectedAccount.microsoftId, connectedAccount.accessToken, connectedAccount.refreshToken)
        }
        res.json(Result.success(connectedAccounts))
    }
    catch(e){
        res.json(Result.error("generic_error","Error getting connected accounts: "+e.message))
    }
})


module.exports = router