import axios from 'axios'

class DBManager{
    constructor(){
    
    }
    login(password){
        this.password = password;
    }
    async listUsers(){
        console.log((await axios.post("/db/list-users",{"db_admin_password":this.password})).data)
    }
    async clearUsers(){
        console.log((await axios.post("/db/clear-all-users",{"db_admin_password":this.password})).data)
    }
}

export default DBManager;