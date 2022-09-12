import * as msal from "@azure/msal-browser"

import axios from 'axios'

import StateManager from "./StateManager"

const msalConfig = {

    auth: {

        clientId: "5cf72937-bd3a-482c-81bc-9da7be139d22",

        authority: "https://login.microsoftonline.com/common/",

        redirectUri: "http://localhost:3000/",

        postLogoutRedirectUri: "http://localhost:3000/"

    }

}

class MSALLogoutHelper {

    constructor(logoutInfo) {
        this.logoutInfo = logoutInfo
        this.msalInstance = new msal.PublicClientApplication(msalConfig)
    }

    async prepare() {
        var microsoftId = this.logoutInfo.microsoftId
        StateManager.upsert.exact(["account_to_detach"], this.logoutInfo)
    }

    async finalize() {
        if (StateManager.query.exact(["account_to_detach"])) {
            await axios.post("http://localhost:8081/api/finalize-logout", { jwt: StateManager.query.exact(["jwt"]), connectedAccountId: this.logoutInfo.connectedAccountId })
            StateManager.upsert.exact(["account_to_detach"], null)
        }
    }

}

export default MSALLogoutHelper