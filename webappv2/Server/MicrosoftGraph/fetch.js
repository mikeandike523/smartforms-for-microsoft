// Adapted from https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-webapp-msal
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var axios = require('axios').default;

/**
 * Attaches a given access token to a MS Graph API call
 * @param endpoint: REST API endpoint to call
 * @param accessToken: raw access token string
 */
async function fetchV10(API_PATH, accessToken) {

    const endpoint = process.env.GRAPH_API_ENDPOINT + "/v1.0/" + API_PATH

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log(`request made to ${endpoint} at: ` + new Date().toString());

    try {
        return (await axios.get(endpoint, options)).data;
    } catch (error) {
        throw new Error(error);
    }
}

async function postV10(API_PATH, accessToken, data) {

    const endpoint = process.env.GRAPH_API_ENDPOINT + "/v1.0/" + API_PATH

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log(`request made to ${endpoint} at: ` + new Date().toString());

    try {
        return (await axios.post(endpoint,data, options)).data;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {graph_get:fetchV10,graph_post:postV10}