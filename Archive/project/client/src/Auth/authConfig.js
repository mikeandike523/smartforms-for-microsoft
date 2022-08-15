// Adapted from https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-react

export const msalConfig = {
    auth: {
      clientId: "5cf72937-bd3a-482c-81bc-9da7be139d22",
      authority: "https://login.microsoftonline.com/d2aa7920-60e2-4e3a-a0e8-de63d47514f1/", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
      redirectUri: "http://localhost:3000/",
    },
    cache: {
      cacheLocation: "sessionStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
  };
  
  // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
  export const loginRequest = {
   scopes: ["User.Read"]
  };
  
  // Add the endpoints here for Microsoft Graph API services you'd like to use.
  export const graphConfig = {
      graphMeEndpoint: "https://graph.microsoft.com/"+"v1.0/me"
  };