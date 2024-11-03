/**
 * ACFrontEnd
 * Copyright (C) 2024 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */
import { Injectable } from "../decorators";
import { HTTPService } from "./HTTPService";
import { OAuth2Config, OAuth2TokenManager } from "./OAuth2TokenManager";

interface OAuth2Request
{
    authorizeEndpoint: string;
    clientId: string;
    redirectURI: string;
    scopes: string[];
    state?: string;
}

interface OAuth2TokenRequest
{
    clientId: string;
    code: string;
    redirectURI: string;
    tokenEndpoint: string;
}

export interface OAuth2TokenResponse
{
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
    scope: string;
    refresh_token?: string;
    id_token?: string;
}

const sessionStorageKey = "ACFrontEnd.OAuth2Service";

@Injectable
export class OAuth2Service
{
    constructor(private httpService: HTTPService, private oAuth2TokenManager: OAuth2TokenManager)
    {
    }

    //Public methods
    public async HandleRedirectResult()
    {
        const params = this.ExtractPostRedirectParameters();
        if(params !== undefined)
        {
            const config: OAuth2Config = this.GetPendingRequestConfig()!;
            const response = await this.RedeemAuthorizationCode({
                clientId: config.clientId,
                code: params.code,
                redirectURI: config.redirectURI,
                tokenEndpoint: config.tokenEndpoint
            });
            if("error" in response)
                throw new Error("TODO: implement me");

            window.sessionStorage.removeItem(sessionStorageKey);
            this.oAuth2TokenManager.AddToken(config, response.access_token, response.scope.split(" "), response.expires_in, response.id_token);

            return params.state!;
        }
    }

    public RequestScopes(config: OAuth2Config, scopes: string[])
    {
        const scopesToRequest = this.oAuth2TokenManager.FetchScopesToGrant(config, scopes);
        if((scopesToRequest !== undefined) && (this.GetPendingRequestConfig() === undefined))
        {
            window.sessionStorage.setItem(sessionStorageKey, JSON.stringify(config));
            this.PerformRedirectLogin({
                authorizeEndpoint: config.authorizeEndpoint,
                clientId: config.clientId,
                redirectURI: config.redirectURI,
                scopes: scopesToRequest,
                state: window.location.pathname
            });
        }

        return this.oAuth2TokenManager.AreScopesGranted(config, scopes);
    }

    //Private methods
    private ExtractPostRedirectParameters()
    {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        const error = urlParams.get("error");
        if(error !== null)
        {
            alert(error);
            throw new Error(error);
        }

        if(code === null)
            return undefined;

        const state = urlParams.get("state");
        return {
            code,
            state: (state === null) ? undefined : decodeURIComponent(state)
        };
    }

    private async GenerateCodeChallenge(codeVerifier: string)
    {
        var digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));

        return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    private GenerateRandomString(length: number)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    private GetPendingRequestConfig()
    {
        const data = window.sessionStorage.getItem(sessionStorageKey);
        if(data === null)
            return undefined;
        const config: OAuth2Config = JSON.parse(data);
        return config;
    }

    private async PerformRedirectLogin(request: OAuth2Request)
    {
        const codeVerifier = this.GenerateRandomString(64);

        const challengeMethod = "S256"; //plain
        const codeChallenge = await this.GenerateCodeChallenge(codeVerifier);

        window.sessionStorage.setItem("code_verifier", codeVerifier);

        var args = new URLSearchParams({
            response_type: "code",
            client_id: request.clientId,
            code_challenge_method: challengeMethod,
            code_challenge: codeChallenge,
            redirect_uri: request.redirectURI,
            scope: request.scopes.join(" "),
        });
        if(request.state !== undefined)
            args.set("state", request.state);
        window.location.href = request.authorizeEndpoint + "/?" + args;
    }

    private async RedeemAuthorizationCode(request: OAuth2TokenRequest)
    {
        const response = await this.httpService.SendRequest({
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            progressTracker: null,
            responseType: "json",
            url: request.tokenEndpoint,
            body: new URLSearchParams({
                client_id: request.clientId,
                code_verifier: window.sessionStorage.getItem("code_verifier")!,
                grant_type: "authorization_code",
                redirect_uri: request.redirectURI,
                code: request.code
            }).toString()
        });

        if(response.statusCode === 200)
            return response.body as OAuth2TokenResponse;
        return {
            error: response.body.error as string,
            description: response.body.error_description as string
        };
    }
}