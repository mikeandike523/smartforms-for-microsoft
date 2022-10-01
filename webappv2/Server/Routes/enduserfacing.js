const express = require('express')

const session = require('express-session')

const cookieParser = require('cookie-parser')

const ConfigLoader = require('../utils/ConfigLoader.js')

const RunAsyncRouteWithErrorHandling = require('../utils/RunAsyncRouteWithErrorHandling.js')

const Result = require('../utils/Result.js')

const Spreadsheet = require('../Models/Spreadsheet')

const ConnectedAccount = require('../Models/ConnectedAccount.js')

const { graphGetWithHealthCheck } = require('../MicrosoftGraph/fetch.js')

const router = express.Router()

router.use(session({
    secret: ConfigLoader(["session", "secret"]),
    saveUninitialized: true,
    cookie: {},
    resave: false
}))

router.use(cookieParser())

// Helper Functions
async function downloadSpreadsheet(spreadsheetid) {
    spreadsheet = await Spreadsheet.findOne({ id: spreadsheetid }).exec()
    connectedAccount = await ConnectedAccount.findOne({ id: spreadsheet.connectedAccount }).exec()
    connectedAccountId = connectedAccount.id
    microsoftItemId = spreadsheet.microsoftItemId
    return graphGetWithHealthCheck(connectedAccountId, "/me/Drive/Root/items/content", {})
}


// Idempotent
router.get('/start/:spreadsheetid', function (req, res) {
    RunAsyncRouteWithErrorHandling(req, res, async function (req, res) {
        if (!req.session || !req.session.spreadsheetid) {
            req.session.spreadsheetid = req.params.spreadsheetid
            req.session.cachedSpreadsheet = downloadSpreadsheet(req.session.spreadsheetid)
        }
        res.json(Result.success({ "debug_spreadsheetid": req.session.spreadsheetid, "debug_cachedSpreadsheet": req.session.cachedSpreadsheet }))
    })
})






module.exports = router