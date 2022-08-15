const mongoose = require('mongoose')
const {nanoid} = import('nanoid')

const UserLoginSchema = mongoose.Schema({
    microsoft_id:'string',
    refresh_token:'string',
    device_token: {
        type: String,
        required: true,
        default: ()=>nanoid(),
        index:{
            unique: true
        }
    }
})

module.exports = mongoose.model('UserLogins',UserLoginSchema)