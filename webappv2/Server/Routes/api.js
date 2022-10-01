const express = require('express');
const jwt = require('jsonwebtoken')
const msal = require('@azure/msal-node')
const Result = require('../Utils/Result.js')
const ConfigLoader = require('../Utils/ConfigLoader');
const User = require('../Models/User.js')
const UserData = require('../Models/UserData.js')
const ConnectedAccount = require('../Models/ConnectedAccount.js')
const Spreadsheet = require('../Models/Spreadsheet.js')
const { graph_get, graph_post, graphGetWithHealthCheck, checkConnectionHealth } = require('../MicrosoftGraph/fetch.js');
const RunAsyncRouteWithErrorHandling = require('../Utils/RunAsyncRouteWithErrorHandling.js');
const { error } = require('../Utils/Result.js');
const JSONDB = require('../Utils/JSONDB.js');
const msalConfig = require('../MicrosoftGraph/authConfig.js').msalConfig
const axios = require('axios')
const qs = require('querystring')
const { getPathComponents } = require('../Utils/PathManagement.js');
const { request } = require('http');

const msalInstance = new msal.ConfidentialClientApplication(msalConfig)
const router = express.Router();

const MW_verifyToken = require('../Utils/MW_verifyToken.js')

router.use(MW_verifyToken)





router.post('/associate-latest-token', async (req, res) => {

    if ((!req.session) || (!req.session.tokenInfo)) {
        res.status(200).json(Result.success("No pending tokens to associate."))
    } else {

        try {

            var tokenInfo = req.session.tokenInfo

            tokenInfo.user = req.userId

            const microsoftId = tokenInfo.microsoftId

            const connectedAccount = await ConnectedAccount.findOneAndUpdate({ microsoftId: microsoftId }, tokenInfo, { upsert: true })

            await new Promise((resolve) => {

                req.session.destroy((err) => {
                    if (err) {
                        throw JSONDB.stringify(err)
                    }
                    resolve()
                })

            })

            res.json(Result.success("Successfully associated last token."))

        }

        catch (e) {

            res.json(Result.error("generic_error", "Could not associate token: " + e.message))

        }


    }
})

router.post('/connected-accounts', async (req, res) => {

    try {
        const userId = req.userId

        const connectedAccounts = await ConnectedAccount.find({ user: userId })

        var results = []

        for (var i = 0; i < connectedAccounts.length; i++) {

            const connectedAccount = connectedAccounts[i]
            const resultObject = {}
            resultObject["userFullName"] = connectedAccount.userFullName
            resultObject["microsoftEmail"] = connectedAccount.microsoftEmail
            resultObject["organizationName"] = connectedAccount.organizationName
            resultObject["health"] = await checkConnectionHealth(connectedAccount.microsoftId, connectedAccount.accessToken, connectedAccount.refreshToken)
            resultObject["id"] = connectedAccount.id

            results.push(resultObject)

        }

        res.json(Result.success(results))
    }
    catch (e) {
        res.json(Result.error("generic_error", "Error getting connected accounts: " + e.message + "\n" + e.stack))
    }


})

router.post('/disconnect-account', async function (req, res) {

    try {

        var accountId = req.body.connectionId;

        const accountObj = await ConnectedAccount.findOne({ id: accountId }).exec()

        const homeAccountId = accountObj.microsoftId

        res.json(Result.success({
            microsoftId: homeAccountId,
            connectedAccountId: accountId
        }))

    } catch (e) {
        res.json(Result.error("generic_error", "Error getting sign-out link: " + e.message))
    }

})

router.post('/finalize-logout', async function (req, res) {

    RunAsyncRouteWithErrorHandling(req, res, async function (req, res) {

        const connectedAccountId = req.body.connectedAccountId

        await ConnectedAccount.findOne({ id: connectedAccountId }).remove().exec()

        res.json(Result.success("Microsoft token storage object with mongodb id " + connectedAccountId + " successfully removed."))

    })

})

router.post('/list-spreadsheets', async function (req, res) {
    RunAsyncRouteWithErrorHandling(req, res, async function (req, res) {
        var spreadsheets = await Spreadsheet.find({ user: req.userId, connectedAccount: req.body.connectedAccount }).exec()
        console.log(req.userId)
        console.log(spreadsheets)
        console.log(req.body.connectedAccount)
        console.log(JSON.stringify(req.body))
        var responseObjects = []
        for (var i = 0; i < spreadsheets.length; i++) {
            var responseObject = {}
            responseObject.id = spreadsheets[i].id
            responseObject.filePath = spreadsheets[i].filePath
            responseObjects.push(responseObject)
        }
        res.json(Result.success(responseObjects))
    })
})

router.post('/file-picker/list', async function (req, res) {
    RunAsyncRouteWithErrorHandling(req, res, async function (req, res) {

        const root = req.body.path

        var components = getPathComponents(root)

        const userId = req.userId

        const connectedAccountId = req.body.connectedAccountId

        var acct = (await ConnectedAccount.findOne({ id: connectedAccountId }).exec())

        if (acct) {

            var response = null;

            if (components.length == 0) {
                response = (await graphGetWithHealthCheck(connectedAccountId, '/me/drive/root/children'))
            }
            else {
                var id_response = (await graphGetWithHealthCheck(connectedAccountId, `/me/drive/root:/${components.join("/")}`)).data
                var microsoftItemId = id_response.id
                response = (await graphGetWithHealthCheck(connectedAccountId, `/me/drive/items/${microsoftItemId}/children`))
            }

            var responseData = []

            for (var i = 0; i < response.data.value.length; i++) {

                var child = response.data.value[i]

                var responseObj = {}

                responseObj.name = child.name
                responseObj.isFolder = !!child.folder

                responseData.push(responseObj)

            }

            res.json(Result.success(responseData))

        }

        else {

            throw "The account connection id for the file picker is no long valid."

        }

    })
})

router.post("/connect-spreadsheet", async (req, res) => {
    RunAsyncRouteWithErrorHandling(req, res, async (req, res) => {

        const root = req.body.path
        var components = getPathComponents(root)
        const userId = req.userId
        const connectedAccountId = req.body.connectedAccountId
        var id_response = (await graphGetWithHealthCheck(connectedAccountId, `/me/drive/root:/${components.join("/")}`)).data
        var microsoftItemId = id_response.id
        var existingRecord = await Spreadsheet.findOne({ microsoftItemId: microsoftItemId })
        if (!existingRecord) {

            await Spreadsheet.findOneAndUpdate({ microsoftItemId: microsoftItemId }, {
                user: req.userId,
                connectedAccount: connectedAccountId,
                microsoftItemId: microsoftItemId,
                filePath: components.join("/"),

            }, { upsert: true }).exec()

            var spreadsheet = await Spreadsheet.findOne({ microsoftItemId: microsoftItemId }).exec()

            res.json(Result.success(spreadsheet.id))

        } else {
            res.json(Result.error("spreadsheet_already_connected", "The selected spreadsheet is already connected, edit the current connection or disconnect it."))
        }
    })
})

module.exports = router