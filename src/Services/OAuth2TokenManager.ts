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
import { Dictionary, Property } from "acts-util-core";
import { Injectable } from "../decorators";

export interface OAuth2Config
{
    flow: "authorizationCode";
    authorizeEndpoint: string;
    clientId: string;
    redirectURI: string;
    tokenEndpoint: string;
}

interface TokenStateJSON
{
    accessToken: string;
    grantedScopes: string[];
    totalRequestedScopes: string[];
}
interface TokenState
{
    accessToken: string;
    grantedScopes: Set<string>;
    totalRequestedScopes: Set<string>;
}

@Injectable
export class OAuth2TokenManager
{
    constructor()
    {
        this._tokenIssued = new Property({ accessToken: "", resourceServer: "" });

        const state = this.ReadState();
        for (const key in state)
        {
            if (Object.prototype.hasOwnProperty.call(state, key))
            {
                const value = state[key]!;
                this._tokenIssued.Set({
                    accessToken: value.accessToken,
                    resourceServer: key
                });
            }
        }
    }

    //Properties
    public get tokenIssued()
    {
        return this._tokenIssued;
    }

    //Public methods
    public AddToken(config: OAuth2Config, accessToken: string, grantedScopes: string[])
    {
        const granted = new Set(grantedScopes);
        const s = this.ReadStateOf(config.authorizeEndpoint);

        this.SetStateOf(config.authorizeEndpoint, {
            accessToken,
            grantedScopes: granted,
            totalRequestedScopes: s.totalRequestedScopes.Union(granted)
        });
        this._tokenIssued.Set({
            accessToken,
            resourceServer: config.authorizeEndpoint
        });
    }

    public AreScopesGranted(config: OAuth2Config, scopes: string[])
    {
        const s = this.ReadStateOf(config.authorizeEndpoint);
        return s.grantedScopes.IsSuperSetOf(new Set(scopes));
    }

    public FetchScopesToGrant(config: OAuth2Config, scopes: string[])
    {
        const s = this.ReadStateOf(config.authorizeEndpoint);
        const requestedScopes = new Set(scopes);
        const requestableScopes = requestedScopes.Without(s.totalRequestedScopes);

        const requireRequest = (s === undefined) || (requestableScopes.size > 0);

        if(requireRequest)
        {
            this.SetStateOf(config.authorizeEndpoint, {
                accessToken: s.accessToken,
                grantedScopes: s.grantedScopes,
                totalRequestedScopes: s.totalRequestedScopes.Union(requestableScopes)
            });

            return scopes.concat(s.grantedScopes.ToArray());
        }
    }

    //Private methods
    private ReadState(): Dictionary<TokenStateJSON>
    {
        const state = window.sessionStorage.getItem("OAuth2TokenManager");
        if(state === null)
        {
            return {
            };
        }
        const parsed = JSON.parse(state) as Dictionary<TokenStateJSON>;
        return parsed;
    }

    private ReadStateOf(authorizeEndpoint: string): TokenState
    {
        const state = this.ReadState();
        const found = state[authorizeEndpoint];
        if(found === undefined)
        {
            return {
                accessToken: "",
                totalRequestedScopes: new Set(),
                grantedScopes: new Set()
            };
        }

        return {
            accessToken: found.accessToken,
            totalRequestedScopes: new Set(found.totalRequestedScopes),
            grantedScopes: new Set(found.grantedScopes)
        };
    }

    private SetStateOf(authorizeEndpoint: string, tokenState: TokenState)
    {
        const key = "OAuth2TokenManager";

        const js: TokenStateJSON = {
            accessToken: tokenState.accessToken,
            totalRequestedScopes: tokenState.totalRequestedScopes.ToArray(),
            grantedScopes: tokenState.grantedScopes.ToArray()
        };

        const state = window.sessionStorage.getItem(key);
        if(state === null)
        {
            window.sessionStorage.setItem(key, JSON.stringify({
                authorizeEndpoint: js
            }));
        }
        else
        {
            const parsed = JSON.parse(state) as Dictionary<TokenStateJSON>;
            parsed[authorizeEndpoint] = js;
            window.sessionStorage.setItem(key, JSON.stringify(parsed));
        }
    }

    //State
    private _tokenIssued: Property<{ accessToken: string; resourceServer: string }>;
}