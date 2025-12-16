const issuer = import.meta.env.VITE_APP_OKTA_ISSUER;
const clientId = import.meta.env.VITE_APP_OKTA_CLIENTID;
const redirectUri = import.meta.env.VITE_APP_OKTA_REDIRECTURI;

export interface OktaConfig {
    issuer: string;
    clientId: string;
    redirectUri: string;
    scopes: string[];
    pkce: boolean
}

export const oktaConfig: OktaConfig = {
    issuer: issuer,
    clientId: clientId,
    redirectUri: redirectUri,
    scopes: ['openid', 'profile', 'email'],
    pkce: true
}