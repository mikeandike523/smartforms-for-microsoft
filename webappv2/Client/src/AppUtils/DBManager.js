import axios from 'axios'
import StateManager from './StateManager';
import { useNavigate } from 'react-router-dom'

class DBManager {
    constructor() {

    }
    login(password) {
        this.password = password;
    }
    async query(route) {
        console.log((await axios.post("/db/" + route, { "db_admin_password": this.password })).data)
        if (route == "clear-all-users") {
            StateManager.upsert.exact(["jwt"], null)
            window.location = "http://localhost:3000/"
        }
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