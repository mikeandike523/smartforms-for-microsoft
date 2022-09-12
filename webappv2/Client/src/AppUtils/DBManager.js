import axios from 'axios'

class DBManager {
    constructor() {

    }
    login(password) {
        this.password = password;
    }
    async query(route) {
        console.log((await axios.post("/db/" + route, { "db_admin_password": this.password })).data)
    }
    help() {
        const possible_commands = [
            "list-users",
            "clear-all-users",
            "list-user-data"
        ]
        console.log("Possible commands:\n" + possible_commands.join("\n"))
    }
}

export default DBManager;