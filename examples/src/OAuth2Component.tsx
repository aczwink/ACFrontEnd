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

import { Component, JSX_CreateElement, Injectable, OAuth2Service, FormField, LineEdit } from "acfrontend";
import { OAuth2TokenResponse } from "../../dist/Services/OAuth2Service";


@Injectable
export class OAuth2Component extends Component
{
    constructor(private oauth2Service: OAuth2Service)
    {
        super();

        this.authorizeEndpoint = "https://login.microsoftonline.com/{your tenant id}/oauth2/v2.0/authorize";
        this.tokenEndpoint = "https://login.microsoftonline.com/{your tenant id}/oauth2/v2.0/token";
        this.clientId = "{your application id}";
        this.code = "";
        this.token = null;
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            <FormField title="Autorize endpoint">
                <LineEdit value={this.authorizeEndpoint} onChanged={newValue => this.authorizeEndpoint = newValue} />
            </FormField>
            <FormField title="Token endpoint">
                <LineEdit value={this.tokenEndpoint} onChanged={newValue => this.tokenEndpoint = newValue} />
            </FormField>
            <FormField title="Client ID">
                <LineEdit value={this.clientId} onChanged={newValue => this.clientId = newValue} />
            </FormField>
            <button type="button" className="btn btn-secondary" onclick={this.OnAuth.bind(this)}>Press me for log in</button>
            <br />
            {this.RenderCode()}
            <br />
            {this.RenderToken()}
        </fragment>;
    }

    //Private state
    private authorizeEndpoint: string;
    private tokenEndpoint: string;
    private clientId: string;
    private code: string;
    private token: OAuth2TokenResponse | null;

    //Private methods
    private RenderCode()
    {
        if(this.code.length === 0)
            return null;

        return <fragment>
            Authorization code: {this.code}
            <br />
            <button type="button" className="btn btn-primary" onclick={this.OnRedeem.bind(this)}>Redeem code</button>
        </fragment>;
    }

    private RenderToken()
    {
        if(this.token === null)
            return null;

        return <fragment>
            You have a token :)

            <p>Access token: {this.token.access_token}</p>
            <p>Expiry: {this.token.expires_in}</p>
            <p>Id token: {this.token.id_token}</p>
            <p>Refresh token: {this.token.refresh_token}</p>
            <p>Scope: {this.token.scope}</p>
            <p>Token type: {this.token.token_type}</p>
        </fragment>
    }

    //Event handlers
    private OnAuth(event: MouseEvent)
    {
        this.oauth2Service.PerformRedirectLogin({
            authorizeEndpoint: this.authorizeEndpoint,
            clientId: this.clientId,
            redirectURI: window.location.href.split('?')[0],
            scopes: ["openid"]
        });
    }

    private async OnRedeem()
    {
        const result = await this.oauth2Service.RedeemAuthorizationCode(this.tokenEndpoint, this.clientId, this.code);
        if("error" in result)
            alert("Error: " + result.error + "\n" + result.description);
        else
            this.token = result;
    }

    override OnInitiated(): void
    {
        if (window.location.search)
        {
            var args = new URLSearchParams(window.location.search);
            var code = args.get("code");

            this.code = code ?? "";
        }
    }
}