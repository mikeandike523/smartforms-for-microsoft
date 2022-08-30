const mongoose = require('mongoose')

const ConnectedAccount = mongoose.Schema({

    "microsoftId":{ // Assuming that microsoft home account ids are unique, and this does not depend on tennants and organizations. TODO: Research whether or not this is true
        "type":String,
        "unique":true
    },
    "microsoftEmail":String,
    "accessToken":String,
    "refreshToken":String,
    "userFullName":String,
    "organizationName":String
    
})

module.exports = mongoose.model('ConnectedAccounts',ConnectedAccount)