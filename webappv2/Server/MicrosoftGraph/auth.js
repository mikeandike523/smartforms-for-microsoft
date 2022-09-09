// Adapted from https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-webapp-msal

var express = require('express');
var msal = require('@azure/msal-node');
const bodyParser = require("body-parser")
const ConfigLoader = require("../Utils/ConfigLoader.js")
const { exit } = require('yargs');
const { default: axios } = require('axios');
const path = require('path')
const fs = require('fs')
var {
    msalConfig,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI
} = require('./authConfig');
const ConnectedAccount = require('../Models/ConnectedAccount.js');

const router = express.Router();
const msalInstance = new msal.ConfidentialClientApplication(msalConfig);
const cryptoProvider = new msal.CryptoProvider();

async function redirectToAuthCodeUrl(req, res, next, authCodeUrlRequestParams, authCodeRequestParams) {

    const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

    req.session.pkceCodes = {
        challengeMethod: 'S256',
        verifier: verifier,
        challenge: challenge,
    };

    req.session.authCodeUrlRequest = {
        redirectUri: REDIRECT_URI,
        responseMode: 'form_post',
        codeChallenge: req.session.pkceCodes.challenge,
        codeChallengeMethod: req.session.pkceCodes.challengeMethod,
        ...authCodeUrlRequestParams,
    };

    req.session.authCodeRequest = {
        redirectUri: REDIRECT_URI,
        code: "",
        ...authCodeRequestParams,
    };

    try {
        var authCodeUrlResponse = await msalInstance.getAuthCodeUrl(req.session.authCodeUrlRequest);

        if(authCodeUrlRequestParams.login_hint){
            authCodeUrlResponse += "&login_hint=" + encodeURIComponent(authCodeUrlRequestParams.login_hint)
        }

        res.send(authCodeUrlResponse)

    } catch (error) {
        next(error);
    }
};

router.post('/signin', async function (req, res, next) {

    const jwt = req.body.jwt

    req.session.csrfToken = cryptoProvider.createNewGuid();

    req.session.jwt = jwt

    var state = cryptoProvider.base64Encode(
        JSON.stringify({
            csrfToken: req.session.csrfToken,
            redirectTo: '/dev-redirect'
        })
    )

    var authCodeUrlRequestParams = {
        state: state,
        scopes: ConfigLoader(["auth","scopes"]),
        prompt:"login"
    };

    var authCodeRequestParams = {
        scopes: ConfigLoader(["auth","scopes"]),
        prompt:"login"
    };

    if(req.body.connectedAccountId){

        console.log("Account specified.")

        var connectedAccount = await ConnectedAccount.findOne({id:req.body.connectedAccountId}).exec()

        var login_hint = connectedAccount.microsoftLoginHint
        console.log("login hint: " + login_hint)

        authCodeUrlRequestParams["login_hint"] = login_hint

        authCodeRequestParams["login_hint"] = login_hint

        console.log(authCodeRequestParams)

        console.log(authCodeUrlRequestParams)

    }

    return redirectToAuthCodeUrl(req, res, next, authCodeUrlRequestParams, authCodeRequestParams)
});

router.post('/redirect', bodyParser.urlencoded({extended: false}), async function (req, res, next) {
    if(req.body)
    if (req.body.state) {
        const state = JSON.parse(cryptoProvider.base64Decode(req.body.state));

        if (state.csrfToken === req.session.csrfToken) {
            req.session.authCodeRequest.code = req.body.code;
            req.session.authCodeRequest.codeVerifier = req.session.pkceCodes.verifier // PKCE Code Verifier

            try {
                const tokenResponse = await msalInstance.acquireTokenByCode(req.session.authCodeRequest);

                // THIS BROKE THE APP SINCE IT CAUSED NODEMON TO RESTART!
                // Switching to plain node during development.
                // fs.writeFileSync('debug_tokenResponse.json',JSON.stringify(tokenResponse))

                req.session.accessToken = tokenResponse.accessToken;
                req.session.idToken = tokenResponse.idToken;
                req.session.account = tokenResponse.account;
                req.session.isAuthenticated = true;

                const extractRefreshToken = () => {
                    const tokenCache = msalInstance.getTokenCache()
                    // console.log(JSON.stringify(tokenCache.storage.cache,null,4))

                    var refreshToken = null;
                    // for(const item in tokenCache.storage.cache){
                    //     if (item.credentialType === 'RefreshToken'){
                    //         refreshToken = item.secret
                    //         break
                    //     }
                    // }
                    // for (var i = 0; i < tokenCache.storage.cache.length; i++) {
                    //     const item = tokenCache.storage.cache[i]
                    //     console.log(item)
                    //     if (item.credentialType === 'RefreshToken'){
                    //         refreshToken = item.secret
                    //         // break
                    //     }
                    // }
                    for(const [key,value] of Object.entries(tokenCache.storage.cache)){
                        const item = value
                        if (item.credentialType === 'RefreshToken'){
                            refreshToken = item.secret
                            break
                        }
                    }
                    return refreshToken
                }

                const tokenCache = msalInstance.getTokenCache()

                // console.log(tokenCache)

                // console.log(tokenCache.storage)

                // console.log(tokenCache.storage.cache)

                req.session.refreshToken = extractRefreshToken()

                console.log(`extractRefreshToken: ${extractRefreshToken()}`)

                console.log(`req.session.refreshToken: ${req.session.refreshToken}`)

                tokenInfo = {}

                tokenInfo["microsoftId"] = req.session.account.homeAccountId

                tokenInfo["userFullName"] = req.session.account.name

                tokenInfo["microsoftEmail"] = req.session.account.username

                tokenInfo["accessToken"] = req.session.accessToken

                tokenInfo["refreshToken"] = req.session.refreshToken

                tokenInfo["organizationName"] = "not yet implemented"

                tokenInfo["microsoftLoginHint"] = req.session.account.idTokenClaims.login_hint

                console.log("Setting tokenInfo")

                req.session["tokenInfo"] = tokenInfo

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

    const logoutUri = `${msalConfig.auth.authority}/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;

    req.session.destroy(() => {
        res.send(logoutUri);
    });

});

module.exports = router;