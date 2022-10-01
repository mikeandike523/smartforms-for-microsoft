// Adapted from https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-webapp-msal

const path = require('path')

var axios = require('axios').default;

const qs = require('querystring')

const ConnectedAccount = require("../Models/ConnectedAccount.js")

async function graph_get(API_PATH, accessToken) {

    const endpoint = process.env.GRAPH_API_ENDPOINT + "/v1.0/" + API_PATH

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log(`get request made to ${endpoint} at: ` + new Date().toString());

    try {
        return (await axios.get(endpoint, options))
    } catch (error) {
        throw new Error(error);
    }
}

async function graph_post(API_PATH, accessToken, data) {

    const endpoint = process.env.GRAPH_API_ENDPOINT + "/v1.0/" + API_PATH

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log(`post request made to ${endpoint} at: ` + new Date().toString());

    try {
        return (await axios.post(endpoint, data, options))
    } catch (error) {
        throw new Error(error);
    }
}

async function aquireNewTokens(microsoftId, accessToken, refreshToken) {
    const endpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    const client_id = msalConfig.auth.clientId
    const scopes = ConfigLoader(["auth", "scopes"])
    const grant_type = "refresh_token"
    const client_secret = process.env.CLIENT_SECRET
    const content_type = "application/x-ww-form-urlencoded"
    const response = await axios.post(endpoint, qs.stringify({
        "client_id": client_id,
        "scope": scopes,
        "client_secret": client_secret,
        "grant_type": grant_type,
        "refresh_token": refreshToken
    }), { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    return [microsoftId, response.data.access_token, response.data.refresh_token]
}

async function updateDatabaseWithTokens(microsoftId, accessToken, refreshToken) {
    await ConnectedAccount.findOneAndUpdate({ "microsoftId": microsoftId }, { accessToken: accessToken, refreshToken: refreshToken }).exec()
}

async function checkConnectionHealth(microsoftId, accessToken, refreshToken) {

    if (!refreshToken || !accessToken) {
        return "dead"
    }
    if (!((microsoftId ?? "").trim())) {
        throw "Microsoft ID is missing or null."
    }
    try {
        const http_response = await graph_get("/me", accessToken)
        if (http_response.status != 200) {
            var [microsoftId, accessToken, refreshToken] = await aquireNewTokens(microsoftId, accessToken, refreshToken)
            await updateDatabaseWithTokens(microsoftId, accessToken, refreshToken)
            const http_response = await graph_get("/me", accessToken)
            return (http_response == 200) ? "alive" : "dead"
        }
        return "alive"
    } catch (e) {

        return "dead"

    }
}

async function graphGetWithHealthCheck(connectedAccountId, endpoint, urlparams) {
    var url_params_string = qs.stringify(urlparams)
    var uri = endpoint + (url_params_string && "?") + (url_params_string ?? "");

    var connectedAccount = await ConnectedAccount.findOne({ id: connectedAccountId }).exec()
    if (!connectedAccount) {
        throw "No connected account matching the given mongodb id."
    }
    var microsoftId = connectedAccount.microsoftId
    var accessToken = connectedAccount.accessToken
    var refreshToken = connectedAccount.refreshToken
    var health = await checkConnectionHealth(microsoftId, accessToken, refreshToken)
    if (health === "dead") {
        throw "The specified Microsoft account connection is dead."
    }
    return graph_get(uri, accessToken)
}

async function graphPostWithHealthCheck(connectedAccountId, endpoint, urlparams, data) {

    var url_params_string = qs.stringify(urlparams)
    var uri = endpoint + (url_params_string && "?") + (url_params_string ?? "");
    var connectedAccount = await ConnectedAccount.findOne({ id: connectedAccountId }).exec()
    if (!connectedAccount) {
        throw "No connected account matching the given mongodb id."
    }
    var microsoftId = connectedAccount.microsoftId
    var accessToken = connectedAccount.accessToken
    var refreshToken = connectedAccount.refreshToken
    var health = await checkConnectionHealth(microsoftId, accessToken, refreshToken)
    if (health === "dead") {
        throw "The specified Microsoft account connection is dead."
    }
    return graph_post(uri, accessToken, data)
}

module.exports = { graph_get: graph_get, graph_post: graph_post, aquireNewTokens: aquireNewTokens, checkConnectionHealth: checkConnectionHealth, graphGetWithHealthCheck: graphGetWithHealthCheck, graphPostWithHealthCheck: graphPostWithHealthCheck, updateDatabaseWithTokens: updateDatabaseWithTokens }