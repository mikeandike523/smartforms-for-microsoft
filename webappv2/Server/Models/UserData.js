// @deprecated

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserData = mongoose.Schema({
    "user":{
        type: Schema.Types.ObjectId,
        ref: 'Users',
    },
    "connectedAccounts":[
        {
            type: Schema.Types.ObjectId,
            ref: 'ConnectedAccounts'
        }
    ]
})

module.exports = mongoose.model('UserData',UserData)