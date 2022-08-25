// Adapted from https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-webapp-msal
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
var msal = require('@azure/msal-node');
var request = require("request")
const fs = require("fs")
const path = require("path")
const bodyParser = require("body-parser")

const ConfigLoader = require("../Utils/ConfigLoader.js")

var {
    msalConfig,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI
} = require('./authConfig');
const { exit } = require('yargs');
const { default: axios } = require('axios');

const router = express.Router();
const msalInstance = new msal.ConfidentialClientApplication(msalConfig);
const cryptoProvider = new msal.CryptoProvider();

/**
 * Prepares the auth code request parameters and initiates the first leg of auth code flow
 * @param req: Express request object
 * @param res: Express response object
 * @param next: Express next function
 * @param authCodeUrlRequestParams: parameters for requesting an auth code url
 * @param authCodeRequestParams: parameters for requesting tokens using auth code
 */
async function redirectToAuthCodeUrl(req, res, next, authCodeUrlRequestParams, authCodeRequestParams) {

    // Generate PKCE Codes before starting the authorization flow
    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

    // Set generated PKCE codes and method as session vars
    req.session.pkceCodes = {
        challengeMethod: 'S256',
        verifier: verifier,
        challenge: challenge,
    };

    /**
     * By manipulating the request objects below before each request, we can obtain
     * auth artifacts with desired claims. For more information, visit:
     * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationurlrequest
     * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationcoderequest
     **/

    req.session.authCodeUrlRequest = {
        redirectUri: REDIRECT_URI,
        responseMode: 'form_post', // recommended for confidential clients
        codeChallenge: req.session.pkceCodes.challenge,
        codeChallengeMethod: req.session.pkceCodes.challengeMethod,
        ...authCodeUrlRequestParams,
    };

    req.session.authCodeRequest = {
        redirectUri: REDIRECT_URI,
        code: "",
        ...authCodeRequestParams,
    };

    const equivalentURL = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/authorize?
    client_id=${process.env.CLIENT_ID}&
    response_type=code&
    redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&
    response_mode=form_post&
    scope=${encodeURIComponent(["user.read","files.readwrite","offline_access"].join(" "))}&
    state=${encodeURIComponent(JSON.stringify(authCodeUrlRequestParams.state))}&
    code_challenge=${encodeURIComponent(req.session.pkceCodes.challenge)}&
    code_challenge_method=S256
    `

    var equivalentURLFormatted = equivalentURL.replace(/\n+/g,"").replace(/ +/g,"")

    console.log(equivalentURL)
    console.log(equivalentURLFormatted)

    //fs.writeFileSync("debug.html",(await axios.get(equivalentURLFormatted,{withCredentials:true})).data)

    // Get url to sign user in and consent to scopes needed for application
    try {
        const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(req.session.authCodeUrlRequest);
        res.send(authCodeUrlResponse)
       //res.send(equivalentURLFormatted)
    } catch (error) {
        next(error);
    }
};

router.post('/signin', async function (req, res, next) {

    const jwt = req.body.jwt

    // create a GUID for crsf
    req.session.csrfToken = cryptoProvider.createNewGuid();

    req.session.jwt = jwt

    /**
     * The MSAL Node library allows you to pass your custom state as state parameter in the Request object.
     * The state parameter can also be used to encode information of the app's state before redirect.
     * You can pass the user's state in the app, such as the page or view they were on, as input to this parameter.
     */
    const state = cryptoProvider.base64Encode(
        JSON.stringify({
            csrfToken: req.session.csrfToken,
            redirectTo: '/dev-redirect'
        })
    );

    const authCodeUrlRequestParams = {
        state: state,

        /**
         * By default, MSAL Node will add OIDC scopes to the auth code url request. For more information, visit:
         * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
         */
        scopes: ["user.read","files.readwrite","offline_access"],
    };

    const authCodeRequestParams = {

        /**
         * By default, MSAL Node will add OIDC scopes to the auth code request. For more information, visit:
         * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
         */
        scopes: ["user.read","files.readwrite","offline_access"],
    };

    // trigger the first leg of auth code flow
    return redirectToAuthCodeUrl(req, res, next, authCodeUrlRequestParams, authCodeRequestParams)
});

router.post('/redirect', bodyParser.urlencoded({extended: false}), async function (req, res, next) {
    if(req.body)
    if (req.body.state) {
        const state = JSON.parse(cryptoProvider.base64Decode(req.body.state));

        // check if csrfToken matches
        if (state.csrfToken === req.session.csrfToken) {
            req.session.authCodeRequest.code = req.body.code; // authZ code
            req.session.authCodeRequest.codeVerifier = req.session.pkceCodes.verifier // PKCE Code Verifier

            try {
                const tokenResponse = await msalInstance.acquireTokenByCode(req.session.authCodeRequest);
                req.session.tokenResponse = tokenResponse // for debug only
                req.session.accessToken = tokenResponse.accessToken;
                req.session.idToken = tokenResponse.idToken;
                req.session.account = tokenResponse.account;
                req.session.isAuthenticated = true;
                console.log(req.session.jwt)

                const extractRefreshToken = () => {
                    const tokenCache = msalInstance.getTokenCache()
                    console.log(tokenCache)
                    console.log(tokenCache.storage.cache)
                    var refreshToken = null;
                    for(const item in tokenCache.storage.cache){
                        if (item.credentialType === 'RefreshToken'){
                            refreshToken = item.secret
                            break
                        }
                    }
                    return refreshToken
                }

                req.session.refreshToken = extractRefreshToken()

                console.log(req.session) // for debug only

                tokenInfo = {}

                tokenInfo["microsoftId"] = req.session.account.homeAccountId

                tokenInfo["userFullName"] = req.session.account.name

                tokenInfo["microsoftEmail"] = req.session.account.username

                tokenInfo["accessToken"] = req.session.accessToken

                tokenInfo["refreshToken"] = req.session.refreshToken

                tokenInfo["organizationName"] = "not yet implemented"

                req.session["tokenInfo"] = tokenInfo

                console.log("Set token info.")

                res.redirect("http://localhost:8081/dev-redirect")
            } catch (error) {
                next(error);
            }
        } else {
            next(new Error('csrf token does not match'));
        }
    } else {
        next(new Error('state is missing'));
    }
    else{

    }
});

router.post('/signout', function (req, res) {
    /**
     * Construct a logout URI and redirect the user to end the
     * session with Azure AD. For more information, visit:
     * https://docs.microsoft.com/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request
     */
    const logoutUri = `${msalConfig.auth.authority}/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;

    req.session.destroy(() => {
        res.send(logoutUri);
    });
});

module.exports = router;