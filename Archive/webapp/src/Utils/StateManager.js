const JSONDB = require('./JSONDB.js')

if(window.application_state_JSONDB === undefined){
    window.application_state_JSONDB = new JSONDB({},{"id":"application_state"})
}

module.exports = window.application_state_JSONDB