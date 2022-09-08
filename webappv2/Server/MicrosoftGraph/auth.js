// Adapted from https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-webapp-msal

var express = require('express');
var msal = require('@azure/msal-node');
const bodyParser = require("body-parser")
const ConfigLoader = require("../Utils/ConfigLoader.js")
const { exit } = require('yargs');
const { default: axios } = require('axios');
const path = require('path')

var {
    msalConfig,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI
} = require('./authConfig');

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

    req.session.csrfToken = cryptoProvider.createNewGuid();

    req.session.jwt = jwt

    const state = cryptoProvider.base64Encode(
        JSON.stringify({
            csrfToken: req.session.csrfToken,
            redirectTo: '/dev-redirect'
        })
    );

    const authCodeUrlRequestParams = {
        state: state,
        scopes: ConfigLoader(["auth","scopes"]),
        prompt:"login"
    };

    const authCodeRequestParams = {
        scopes: ConfigLoader(["auth","scopes"]),
    };

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