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

interface OAuth2Request
{
    authorizeEndpoint: string;
    clientId: string;
    redirectURI: string;
    scopes: string[];
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

@Injectable
export class OAuth2Service
{
    constructor(private httpService: HTTPService)
    {
    }

    //Public methods
    public async PerformRedirectLogin(request: OAuth2Request)
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
            scope: request.scopes.join(" ")
        });
        window.location.href = request.authorizeEndpoint + "/?" + args;
    }

    public async RedeemAuthorizationCode(tokenEndpoint: string, clientId: string, code: string)
    {
        const response = await this.httpService.SendRequest({
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            progressTracker: null,
            responseType: "json",
            url: tokenEndpoint,
            body: new URLSearchParams({
                client_id: clientId,
                code_verifier: window.sessionStorage.getItem("code_verifier")!,
                grant_type: "authorization_code",
                redirect_uri: location.href.replace(location.search, ''),
                code: code
            }).toString()
        });

        if(response.statusCode === 200)
            return response.body as OAuth2TokenResponse;
        return {
            error: response.body.error as string,
            description: response.body.error_description as string
        };
    }

    //Private methods
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
}