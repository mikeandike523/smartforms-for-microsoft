const Result = require('./Result.js')

async function RunAsyncRouteWithErrorHandling(req,res,route){
    
    try{
        await route(req,res)
    }catch(e){
        console.log(e)
        console.log(e.message)
        console.log(e.stack)
        res.json(Result.error("generic_error",e.message+"\n"+e.stack))
        return false
    }

    return true
}

module.exports = RunAsyncRouteWithErrorHandling