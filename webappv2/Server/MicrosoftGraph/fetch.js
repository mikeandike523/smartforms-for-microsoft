// Adapted from https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-webapp-msal

const path = require('path')

var axios = require('axios').default;

async function graph_get (API_PATH, accessToken) {

    const endpoint = process.env.GRAPH_API_ENDPOINT + "/v1.0/" + API_PATH

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log(`get request made to ${endpoint} at: ` + new Date().toString());

    try {
        return (await axios.get(endpoint, options)).data;
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
        return (await axios.post(endpoint,data, options)).data;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {graph_get:graph_get,graph_post:graph_post}