import * as msal from "@azure/msal-browser"

import axios from 'axios'

// @TODO: Find out if it is safe to disclose client-id (user-facing app / source code)

import StateManager from "./StateManager" 

const msalConfig = {

    auth: {

        clientId: "5cf72937-bd3a-482c-81bc-9da7be139d22",

        // Note: it seems from https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#:~:text=If%20your%20application%20audience%20is%20a%20single%20tenant%2C%20you%20must%20provide%20an%20authority%20with%20your%20tenant%20id%20like%20below%3A that the issue where I had to add users to the app manually is due to using a tenant-id with the authority url on ther server side. @TODO: Look into this

        authority: "https://login.microsoftonline.com/common/",

        redirectUri: "http://localhost:3000/",

        postLogoutRedirectUri: "http://localhost:3000/"

    }

}

class MSALLogoutHelper{

    constructor(logoutInfo){
        this.logoutInfo = logoutInfo
        this.msalInstance = new msal.PublicClientApplication(msalConfig)
    }

    async prepare(){
        var microsoftId = this.logoutInfo.microsoftId
        StateManager.upsert.exact(["account_to_detach"],this.logoutInfo)


        // In Dashboard.js the page trigger a refresh automatically after a few ms, making the assumption that the logout went through. @TODO: Add polling of the health of the connection to make sure user accutally logged out correctly.
        // try{
        //     await this.msalInstance.logoutPopup({account:microsoftId})
        //     window.location.reload()
        // }catch(e){
        //     console.log("Sign-out popup failed: " + e.message)
        // }
    }

    async finalize(){
        if(StateManager.query.exact(["account_to_detach"])){
            await axios.post("http://localhost:8081/api/finalize-logout",{jwt:StateManager.query.exact(["jwt"]),connectedAccountId:this.logoutInfo.connectedAccountId})
            StateManager.upsert.exact(["account_to_detach"],null)
        }
    }

}

export default MSALLogoutHelper