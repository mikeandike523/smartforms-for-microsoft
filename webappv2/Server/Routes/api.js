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
    if(!refreshToken){
        return "dead"
    }
    return "alive"
}

router.post('/associate-latest-token',async (req,res) => {

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
            connectedAccounts[foundAccount].accessToken = tokenInfo.accessToken
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
        const userData = await UserData.findOne({"user":req.userId}).populate("connectedAccounts").exec()
        var connectedAccounts = JSON.parse(JSON.stringify(userData.connectedAccounts));
        for(var i = 0; i < connectedAccounts.length; i++){
            const connectedAccount = connectedAccounts[i]
            connectedAccounts[i]["health"] = await checkConnectionHealth(connectedAccount.microsoftId, connectedAccount.accessToken, connectedAccount.refreshToken)
        }
        var connectedAccountResults = []
        for(var i =0; i<connectedAccounts.length;i++){
            const connectedAccount = connectedAccounts[i]
            const resultObject = {}
            
            //Respond only with necessary fields for the ui
            resultObject["userFullName"] = connectedAccount.userFullName
            resultObject["microsoftEmail"] = connectedAccount.microsoftEmail
            resultObject["organizationName"] = connectedAccount.organizationName
            resultObject["health"] = connectedAccount.health

            connectedAccountResults.push(resultObject)
        }
        res.json(Result.success(connectedAccountResults))
    }
    catch(e){
        res.json(Result.error("generic_error","Error getting connected accounts: "+e.message))
    }

})

module.exports = router