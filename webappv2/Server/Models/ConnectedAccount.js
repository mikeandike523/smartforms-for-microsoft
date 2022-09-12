const mongoose = require('mongoose')

const ConnectedAccount = mongoose.Schema({
    "user": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    "microsoftId": {
        "type": String,
        "unique": true
    },
    "microsoftLoginHint": String,
    "microsoftEmail": String,
    "accessToken": String,
    "refreshToken": String,
    "userFullName": String,
    "organizationName": String

})

module.exports = mongoose.model('ConnectedAccounts', ConnectedAccount)