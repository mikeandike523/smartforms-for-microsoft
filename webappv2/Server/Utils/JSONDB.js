class LocalStorageSimulator{
    constructor(){
        this.fs = require("fs")
        this.path = require("path")
        this.storage = {}
        if(!this.fs.existsSync(this.path.resolve(__dirname+"localStorage.json"))){
            this.fs.writeFileSync(JSON.stringify({}))
        }
        this.load()
    }
    setItem(key, strvalue){
        this.load()
        this.storage[key] = strvalue
        this.save()
    }
    getItem(key){
        this.load()
        return this.storage[key]
    }
    save(){
        this.fs.writeFileSync(this.path.resolve(__dirname+"localStorage.json"), JSON.stringify(this.storage))
    }
    load(){
        this.storage = JSON.parse(this.fs.readFileSync(this.path.resolve(__dirname+"/localStorage.json")))
    }
}
function JSONDB(data){

    this.data = data
    this.query = {}
    this.upsert = {} 
    this.query.exact = (keys)=>{
        var keys_copy = JSON.parse(JSON.stringify(keys))
        var peeled = this.data
        while(keys_copy.length > 0){
            var key = keys_copy.shift()
            peeled = peeled[key]
            if (peeled===undefined){
                throw "Key path did not match any records.";
            }
            if(typeof peeled !== 'object' || keys_copy.length==0){
                if (keys_copy.length > 0){
                    throw "Key path contained a non-object before the last key."
                }
                return peeled
            }
        }
    }
}

module.exports = JSONDB