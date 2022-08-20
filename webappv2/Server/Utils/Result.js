class Result {
    constructor(status,code,data) {
        this._status = status;
        this._code = code;
        this._data = data;
        
    }
    status(){
        return this._status
    }
    code(){
        return this._code
    }
    data(){
        return this._data
    }
    obj(){
        return {
            status: this.status(),
            code: this.code(),
            data: this.data()
        }
    }


    //Result Builders
    static success(data){
        return new Result("success",undefined,data);
    }
    static error(code,data){
        return new Result("error",code,data)
    }
}

module.exports = Result