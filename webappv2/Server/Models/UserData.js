const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserData = mongoose.Schema({
    "user":{
        type: Schema.Types.ObjectId,
        ref: 'Users',
    },
    "connectedAccounts":[{
        "microsoftId":String,
        "microsoftEmail":String,
        "accessToken":String,
        "refreshToken":String,
        "userFullName":String,
        "organizationName":String
    }]
})

module.exports = mongoose.model('UserData',UserData)