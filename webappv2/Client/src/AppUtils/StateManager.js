import JSONDB from './JSONDB.js'

if(window.application_state_JSONDB === undefined){
    window.application_state_JSONDB = new JSONDB({},{"id":"application_state"})
}

export default window.application_state_JSONDB