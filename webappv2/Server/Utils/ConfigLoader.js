const fs = require('fs');
const path = require('path');

const JSONDB = require('./JSONDB.js')

function ConfigLoader(keys, dirname = null) {
    var keys_copy = JSON.parse(JSON.stringify(keys))
    const filename = keys_copy[0]
    var dn = __dirname
    if (dirname)
        dn = dirname
    const fileData = JSON.parse(fs.readFileSync(path.resolve(dn + "/../Config/" + filename + ".json")))
    keys_copy.shift()
    return (new JSONDB(fileData)).query.exact(keys_copy)
}

module.exports = ConfigLoader