const express = require('express');
const jwt = require('jsonwebtoken')
const msal = require('@azure/msal-node')
const Result = require('../Utils/Result.js')
const ConfigLoader = require('../Utils/ConfigLoader');
const User = require('../Models/User.js')
const UserData = require('../Models/UserData.js')
const ConnectedAccount = require('../Models/ConnectedAccount.js')
const Spreadsheet = require('../Models/Spreadsheet.js')
const {graph_get, graph_post} = require('../MicrosoftGraph/fetch.js');
const RunAsyncRouteWithErrorHandling = require('../Utils/RunAsyncRouteWithErrorHandling.js');
const { error } = require('../Utils/Result.js');
const JSONDB = require('../Utils/JSONDB.js');
const msalConfig = require('../MicrosoftGraph/authConfig.js').msalConfig
const axios = require('axios')
const qs= require('querystring')
const {getPathComponents} = require('../Utils/PathManagement.js')

const msalInstance = new msal.ConfidentialClientApplication(msalConfig)
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

async function aquireNewTokens(microsoftId,accessToken,refreshToken){
    console.log('aquireNewTokens called')
    const endpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    const client_id = msalConfig.auth.clientId
    const scopes = ConfigLoader(["auth","scopes"])
    const grant_type = "refresh_token"
    const client_secret = process.env.CLIENT_SECRET
    const content_type = "application/x-ww-form-urlencoded"
    const response = await axios.post(endpoint,qs.stringify({
        "client_id": client_id,
        "scope":scopes,
        "client_secret": client_secret,
        "grant_type":grant_type,
        "refresh_token":refreshToken
    }),{headers: { 'content-type': 'application/x-www-form-urlencoded' }})
    console.log(response.data.access_token)
    return [microsoftId,response.data.access_token,response.data.refresh_token]
}

async function updateDatabaseWithTokens(microsoftId,accessToken,refreshToken){
    await ConnectedAccount.findOneAndUpdate({"microsoftId":microsoftId},{accessToken:accessToken,refreshToken:refreshToken}).exec()
}

async function checkConnectionHealth(microsoftId,accessToken,refreshToken){
    // //for debug only
    // const tokenInfo = await aquireNewTokens(microsoftId,accessToken,refreshToken)

    if(!refreshToken||!accessToken){
        return "dead"
    }
    if(!((microsoftId??"").trim())){
        throw "Microsoft ID is missing or null."
    }
    try{
        const http_response = await graph_get("/me",accessToken)
        if(http_response.status!=200){
            var [microsoftId,accessToken,refreshToken] = await aquireNewTokens(microsoftId,accessToken,refreshToken)
            await updateDatabaseWithTokens(microsoftId,accessToken,refreshToken)
            const http_response = await graph_get("/me",accessToken)
            console.log("http response: "+JSON.stringify(http_response))
            return (http_response == 200) ? "alive" : "dead"
        }
        return "alive"       
    }catch(e){

        console.log("Error occured while checking connection health: "+e.message+"\n"+e.stack)

        return "dead" // In the future need to handle errors instead of assume dead

        // throw e // Throwing the error broke the route
    }
}


async function graphGetWithHealthCheck(connectedAccountId,endpoint,urlparams){
    var url_params_string = qs.stringify(urlparams)
    var uri = endpoint+(url_params_string&&"?")+(url_params_string??"");

    var connectedAccount = await ConnectedAccount.findOne({id:connectedAccountId}).exec()
    if(!connectedAccount){
        throw "No connected account matching the given mongodb id."
    }
    var microsoftId = connectedAccount.microsoftId
    var accessToken = connectedAccount.accessToken
    var refreshToken = connectedAccount.refreshToken
    var health = await checkConnectionHealth(microsoftId, accessToken, refreshToken)
    if(health==="dead"){
        throw "The specified Microsoft account connection is dead."
    }
    return graph_get(uri,accessToken)
}

async function graphPostWithHealthCheck(connectedAccountId,endpoint,urlparams,data){

    var url_params_string = qs.stringify(urlparams)
    var uri = endpoint+(url_params_string&&"?")+(url_params_string??"");
    var connectedAccount = await ConnectedAccount.findOne({id:connectedAccountId}).exec()
    if(!connectedAccount){
        throw "No connected account matching the given mongodb id."
    }
    var microsoftId = connectedAccount.microsoftId
    var accessToken = connectedAccount.accessToken
    var refreshToken = connectedAccount.refreshToken
    var health = await checkConnectionHealth(microsoftId, accessToken, refreshToken)
    if(health==="dead"){
        throw "The specified Microsoft account connection is dead."
    }
    return graph_post(uri,accessToken,data)
}


router.post('/associate-latest-token',async (req,res) => {


    // RACE CONDITION DETECTED

    // Whether the useffect hook causes several rapid calls to this api route, or the page is simply refreshed, there is a race condition and the check for an existing account with the corresponding microsoftId may fail as the document is created in ConnectedAccounts but its id may not yet be inserted into the connectedAccounts array in the corresponding UserData document

    // @TODO: Switch to findOneAndUpdate instead of save where needed


    if((!req.session)||(!req.session.tokenInfo)){
        console.log("No pending tokens to associate.")
        res.status(200).json(Result.success("No pending tokens to associate."))
    }else{
        console.log("Associating token...")
        // const tokenInfo = req.session.tokenInfo
        // const userId = req.userId;
        // const userData = await UserData.findOne({user:userId})
        // const connectedAccounts = userData.connectedAccounts
        // var accountExists = false
        // var foundAccount = -1
        // for(var i=0; i<connectedAccounts.length; i++){
        //     if(connectedAccounts[i].microsoftId == tokenInfo.microsoftId){
        //         accountExists = true
        //         foundAccount = i
        //         break
        //     }
        // }
        // if(accountExists){
        //     connectedAccounts[foundAccount].microsoftId = tokenInfo.microsoftId
        //     connectedAccounts[foundAccount].userFullName = tokenInfo.userFullName
        //     connectedAccounts[foundAccount].microsoftEmail = tokenInfo.microsoftEmail
        //     connectedAccounts[foundAccount].accessToken = tokenInfo.accessToken
        //     connectedAccounts[foundAccount].refreshToken = tokenInfo.refreshToken
        //     connectedAccounts[foundAccount].organizationName = tokenInfo.organizationName
        // }else{
        //     const connectedAccount = await ConnectedAccount(tokenInfo).save()
        //     connectedAccounts.push(connectedAccount.id)
        // }
        // await UserData.findOneAndUpdate({user:req.userId},{connectedAccounts:connectedAccounts})
        // res.status(200).json("Microsoft account successfully linked.")
    
        // const user = await User.findOne({id:req.userId})
        // const userData = await UserData.findOne({user:user.id}).populate('connectedAccounts').exec()
        // const connectedAccounts = userData.connectedAccounts
        // var existingConnectionIdx = -1
        // for(var i =0; i< connectedAccounts.length; i++){
        //     const connectedAccount = connectedAccounts[i]
        //     if(connectedAccount.microsoftId == req.session.tokenInfo.microsoftId){
        //         existingConnectionIdx = i
        //         break
        //     }
        // }

        // if(existingConnectionIdx == -1){
        //     console.log("Not Found")
        //     console.log(connectedAccounts)
        //     const connectedAccount = await ConnectedAccount(req.session.tokenInfo).save()
        //     userData.connectedAccounts.push(connectedAccount)
        //     await userData.save()

        // }else{
        //     console.log("Found")
        //     var connectedAccount = connectedAccounts[i]
        //     Object.assign(connectedAccount,req.session.tokenInfo)
        //     await connectedAccount.save()
        // }


        try{

        var tokenInfo = req.session.tokenInfo

        tokenInfo.user = req.userId

        const microsoftId = tokenInfo.microsoftId

        const connectedAccount = await ConnectedAccount.findOneAndUpdate({microsoftId:microsoftId},tokenInfo,{upsert:true})

        console.log(connectedAccount)

        await new Promise((resolve)=>{

            req.session.destroy((err)=>{
                if(err){
                    throw JSONDB.stringify(err)
                }
                resolve()
            })
            
        })

        res.json(Result.success("Successfully associated last token."))

        }

        catch(e)

        {

            res.json(Result.error("generic_error","Could not associate token: "+e.message))

        }

    
    }
})

router.post('/connected-accounts',async (req,res)=>{

    // try{
    //     const userData = await UserData.findOne({"user":req.userId}).populate("connectedAccounts").exec()
    //     var connectedAccounts = JSON.parse(JSON.stringify(userData.connectedAccounts));
    //     for(var i = 0; i < connectedAccounts.length; i++){
    //         const connectedAccount = connectedAccounts[i]
    //         connectedAccounts[i]["health"] = await checkConnectionHealth(connectedAccount.microsoftId, connectedAccount.accessToken, connectedAccount.refreshToken)
    //     }
    //     var connectedAccountResults = []
    //     for(var i =0; i<connectedAccounts.length;i++){
    //         const connectedAccount = connectedAccounts[i]
    //         const resultObject = {}
            
    //         //Respond only with necessary fields for the ui
    //         resultObject["userFullName"] = connectedAccount.userFullName
    //         resultObject["microsoftEmail"] = connectedAccount.microsoftEmail
    //         resultObject["organizationName"] = connectedAccount.organizationName
    //         resultObject["health"] = connectedAccount.health
    //         resultObject["id"] = connectedAccount.id //mongodb document id 

    //         connectedAccountResults.push(resultObject)
    //     }
    //     res.json(Result.success(connectedAccountResults))
    // }
    // catch(e){
    //     res.json(Result.error("generic_error","Error getting connected accounts: "+e.message))
    // }

    try{
        const userId = req.userId

        const connectedAccounts = await ConnectedAccount.find({user:userId})

        var results = []

        for( var i = 0; i<connectedAccounts.length; i++){

            const connectedAccount = connectedAccounts[i]
            const resultObject = {}

            //Respond only with necessary fields for the ui
            resultObject["userFullName"] = connectedAccount.userFullName
            resultObject["microsoftEmail"] = connectedAccount.microsoftEmail
            resultObject["organizationName"] = connectedAccount.organizationName
            resultObject["health"] = await checkConnectionHealth(connectedAccount.microsoftId, connectedAccount.accessToken, connectedAccount.refreshToken)
            resultObject["id"] = connectedAccount.id //mongodb document id 

            results.push(resultObject)

        }

        res.json(Result.success(results))
    }
    catch(e){
        res.json(Result.error("generic_error","Error getting connected accounts: "+e.message+"\n"+e.stack))
    }


})


// Returns microsoft Id so user can logout on the frontend
router.post('/disconnect-account',async function(req,res){

    try{

        var accountId = req.body.connectionId; //mongodb _id

        const accountObj = await ConnectedAccount.findOne({id:accountId}).exec() 

        const homeAccountId = accountObj.microsoftId

        res.json(Result.success({
            microsoftId:homeAccountId,
            connectedAccountId: accountId
        }))
        
    }catch(e){
        res.json(Result.error("generic_error","Error getting sign-out link: "+e.message))
    }

})

router.post('/finalize-logout', async function(req, res){

    RunAsyncRouteWithErrorHandling(req,res, async function(req,res){

        const connectedAccountId = req.body.connectedAccountId

        await ConnectedAccount.findOne({id:connectedAccountId}).remove().exec()

        res.json(Result.success("Microsoft token storage object with mongodb id "+connectedAccountId+" successfully removed."))

    })

})

router.post('/list-spreadsheets',async function(req,res){
    RunAsyncRouteWithErrorHandling(req,res, async function(req,res){
        var spreadsheets = await Spreadsheet.find({user:req.userId,connectedAccount:req.body.connectedAccount}).exec()
        var responseObjects = []
        for(var i=0; i<spreadsheets.length; i++){
            var responseObject = {}
            responseObject.id = spreadsheets[i].id
            responseObject.name = spreadsheets[i].name
            responseObject.parentDirectoryPath = spreadsheets[i].parentDirectoryPath
            responseObject.applicationURL = spreadsheets[i].applicationURL
            responseObjects.push(responseObject)
        }
        res.json(Result.success(responseObjects))
    })
})

router.post('/file-picker/list', async function(req,res){
    RunAsyncRouteWithErrorHandling(req,res, async function(req,res){
        
        const root = req.body.path

        var components = getPathComponents(root)

        const userId = req.userId

        const connectedAccountId = req.body.connectedAccountId

        var acct = (await ConnectedAccount.findOne({id:connectedAccountId}).exec())

        if(acct){

            var response = null;

            if(components.length == 0){
                response = (await graphGetWithHealthCheck(connectedAccountId, '/me/drive/root/children'))
            }
            else{
                response = (await graphGetWithHealthCheck(connectedAccountId, `/me/drive/root/:${components.join("/")}/children`))
            }

            console.log(response.data)

            var responseData = []

            for(var i=0; i< response.data.value.length; i++){

                var child = response.data.value[i]

                var responseObj = {}

                responseObj.name = child.name
                responseObj.isFolder = !!child.folder

                responseData.push(responseObj)
                
            }

            res.json(Result.success(responseData))

        }

        else{

            throw "The account connection id for the file picker is no long valid."

        }

    })
})


// Notify mongodb database that connection was removed

module.exports = router