function CreatePersistentStore(id){

        if(localStorage.getItem(id)===null){
            localStorage.setItem(id, JSON.stringify({}));
        }

        var dict_obj = {}

        var load = function(target){
            target = JSON.parse(localStorage.getItem(id))
        }

        var save = function(target){
            localStorage.setItem(id, JSON.stringify(target));
        }

        var proxy_handler = {
            get: function(target, key){
                load(target)
                return target[key]
            },
            set: function(target, key, val){
                load(target)
                target[key] = val
                save(target)
            }
        }

        return new Proxy(dict_obj,proxy_handler)

}
function JSONDB(data,persistence={}){
    if(persistence["id"]!==undefined){
        data = CreatePersistentStore(persistence["id"])
    }
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
                //throw "Key path did not match any records.";
                return undefined
            }
            if(typeof peeled !== 'object' || keys_copy.length==0){
                if (keys_copy.length > 0){
                    throw "Key path contained a non-object before the last key."
                }
                return peeled
            }
        }
    }
    this.upsert.exact = (keys,value)=>{
        var new_value_fn = value
        if (typeof new_value_fn !== 'function'){
            var value_copy = JSON.parse(JSON.stringify(value));
            new_value_fn = function(existing){
                return value_copy
            }
        }
        var keys_copy = JSON.parse(JSON.stringify(keys))
        var peeled = this.data
        while(keys_copy.length > 0){
            var key = keys_copy.shift()
            peeled = peeled[key]
            if (peeled===undefined){
                //throw "Key path did not match any records.";
            }
            if(typeof peeled !== 'object' || keys_copy.length==0){
                if (keys_copy.length > 0){
                    throw "Key path contained a non-object before the last key."
                }
                peeled[key] = new_value_fn(peeled[key])
            }
        }
    }
}

export default JSONDB