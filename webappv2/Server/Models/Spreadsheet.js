const mongoose = require('mongoose')

const Spreadsheet = mongoose.Schema({
    "user": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    "connectedAccount": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ConnectedAccounts"
    },
    "microsoftItemId": {
        type: "String",
        unique: true
    },
    "filePath": String
})

module.exports = mongoose.model('Spreadsheets', Spreadsheet)