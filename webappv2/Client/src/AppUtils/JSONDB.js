function CreatePersistentStore(id) {

    if (sessionStorage.getItem(id) === null) {
        sessionStorage.setItem(id, JSON.stringify({}));
    }

    var dict_obj = {}

    var load = function () {
        return JSON.parse(sessionStorage.getItem(id))
    }

    var save = function (target) {
        sessionStorage.setItem(id, JSON.stringify(target));
    }

    var proxy_handler = {
        get: function (target, key) {
            target = load()
            return target[key]
        },
        set: function (target, key, val) {
            target = load()
            target[key] = val
            save(target)
            return true
        }
    }

    return new Proxy(dict_obj, proxy_handler)

}
function JSONDB(data, persistence = {}) {
    if (persistence["id"] !== undefined) {
        data = CreatePersistentStore(persistence["id"])
    }
    this.data = data
    this.query = {}
    this.upsert = {}
    this.query.exact = (keys) => {
        var keys_copy = JSON.parse(JSON.stringify(keys))
        var peeled = this.data
        while (keys_copy.length > 0) {
            var key = keys_copy.shift()
            peeled = peeled[key]
            if (peeled === undefined) {
                return undefined
            }
            if (typeof peeled !== 'object' || keys_copy.length == 0) {
                if (keys_copy.length > 0) {
                    throw "Key path contained a non-object before the last key."
                }
                return peeled
            }
        }
    }
    this.upsert.exact = (keys, value) => {
        var new_value_fn = value
        if (typeof new_value_fn !== 'function') {
            var value_copy = JSON.parse(JSON.stringify(value));
            new_value_fn = function (existing) {
                return value_copy
            }
        }
        var keys_copy = JSON.parse(JSON.stringify(keys))
        var peeled = this.data
        while (keys_copy.length > 0) {
            var key = keys_copy.shift()
            if (peeled[key] === undefined && keys_copy.length > 1) {
                peeled[key] = {}
            }
            if (keys_copy.length > 0)
                peeled = peeled[key]
            if (keys_copy.length == 0) {
                peeled[key] = new_value_fn(peeled[key])
            }
        }
    }
}

export default JSONDB