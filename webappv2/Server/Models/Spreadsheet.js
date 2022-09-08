const mongoose = require('mongoose')

const Spreadsheet = mongoose.Schema({
    "user":{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    "connectedAccount":{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ConnectedAccounts"
    },
    "microsoftId":String,
    "name" : String,
    "parentDirectoryPath" : String,
    "applicationURL": String, 
    
})

module.exports = mongoose.model('Spreadsheets',Spreadsheet)