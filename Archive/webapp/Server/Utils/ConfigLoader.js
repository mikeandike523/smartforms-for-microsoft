const fs = require('fs');
const path = require('path');

const JSONDB = require('./JSONDB.js')

function ConfigLoader(keys){
    var keys_copy = JSON.parse(JSON.stringify(keys))
    const filename = keys_copy[0]
    const fileData = JSON.parse(fs.readFileSync(path.resolve(__dirname+"/../Config/"+filename+".json")))
    keys_copy.shift()
    return (new JSONDB(fileData)).query.exact(keys_copy)
}

module.exports = ConfigLoader