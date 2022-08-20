const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({

    email: String,
    password: String,
    accountType: {
        type: String,
        default: 'user'
    }

})

module.exports = mongoose.model('Users',UserSchema)