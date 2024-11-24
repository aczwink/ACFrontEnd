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
    endSessionEndpoint: string;
    postLogoutRedirectURI: string;
    redirectURI: string;
    tokenEndpoint: string;
}

interface TokenStateJSON
{
    accessToken: string;
    expiryTime: number;
    idToken: string | undefined;
    grantedScopes: string[];
    totalRequestedScopes: string[];
}
interface TokenState
{
    accessToken: string;
    expiryTime: number;
    idToken: string | undefined;
    grantedScopes: Set<string>;
    totalRequestedScopes: Set<string>;
}

interface TokenIssuedData
{
    accessToken: string;
    idToken: string | undefined;
    resourceServer: string;
}

const sessionStorageKey = "ACFrontEnd.OAuth2TokenManager";

@Injectable
export class OAuth2TokenManager
{
    constructor()
    {
        this._tokenIssued = new Property({ accessToken: "", idToken: undefined, resourceServer: "" });

        const state = this.ReadState();
        for (const key in state)
        {
            if (Object.prototype.hasOwnProperty.call(state, key))
            {
                const value = state[key]!;
                this._tokenIssued.Set({
                    accessToken: value.accessToken,
                    idToken: value.idToken,
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
    public AddToken(config: OAuth2Config, accessToken: string, grantedScopes: string[], expiresIn: number, idToken: string | undefined)
    {
        const granted = new Set(grantedScopes);
        const s = this.ReadStateOf(config.authorizeEndpoint);

        this.SetStateOf(config.authorizeEndpoint, {
            accessToken,
            expiryTime: Date.now() + expiresIn * 1000,
            idToken,
            grantedScopes: granted,
            totalRequestedScopes: s.totalRequestedScopes.Union(granted)
        });
        this._tokenIssued.Set({
            accessToken,
            idToken,
            resourceServer: config.authorizeEndpoint
        });
    }

    public AreScopesGranted(config: OAuth2Config, scopes: string[])
    {
        const s = this.ReadStateOf(config.authorizeEndpoint);
        if(s.idToken !== undefined)
        {
            const oidcScopes = ["openid", "email", "profile"];
            return s.grantedScopes.IsSuperSetOf(new Set(scopes).Without(new Set(oidcScopes)));
        }
        return s.grantedScopes.IsSuperSetOf(new Set(scopes));
    }

    public FetchScopesToGrant(config: OAuth2Config, scopes: string[])
    {
        const s = this.ReadStateOf(config.authorizeEndpoint);
        const requestedScopes = new Set(scopes);
        const requestableScopes = requestedScopes.Without(s.totalRequestedScopes);

        const requireRequest = (s === undefined) || (requestableScopes.size > 0) || (s.expiryTime < Date.now());

        if(requireRequest)
        {
            this.SetStateOf(config.authorizeEndpoint, {
                accessToken: s.accessToken,
                expiryTime: s.expiryTime,
                idToken: s.idToken,
                grantedScopes: s.grantedScopes,
                totalRequestedScopes: s.totalRequestedScopes.Union(requestableScopes)
            });

            return scopes.concat(s.grantedScopes.ToArray());
        }
    }

    public RemoveToken(config: OAuth2Config)
    {
        this.SetStateOf(config.authorizeEndpoint, {
            accessToken: "",
            expiryTime: 0,
            grantedScopes: new Set(),
            idToken: undefined,
            totalRequestedScopes: new Set()
        });
        this._tokenIssued.Set({
            accessToken: "",
            idToken: undefined,
            resourceServer: config.authorizeEndpoint
        });
    }

    //Private methods
    private ReadState(): Dictionary<TokenStateJSON>
    {
        const state = window.sessionStorage.getItem(sessionStorageKey);
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
                expiryTime: 0,
                idToken: undefined,
                totalRequestedScopes: new Set(),
                grantedScopes: new Set()
            };
        }

        return {
            accessToken: found.accessToken,
            expiryTime: found.expiryTime,
            idToken: found.idToken,
            totalRequestedScopes: new Set(found.totalRequestedScopes),
            grantedScopes: new Set(found.grantedScopes)
        };
    }

    private SetStateOf(authorizeEndpoint: string, tokenState: TokenState)
    {
        const js: TokenStateJSON = {
            accessToken: tokenState.accessToken,
            expiryTime: tokenState.expiryTime,
            idToken: tokenState.idToken,
            totalRequestedScopes: tokenState.totalRequestedScopes.ToArray(),
            grantedScopes: tokenState.grantedScopes.ToArray()
        };

        const state = window.sessionStorage.getItem(sessionStorageKey);
        if(state === null)
        {
            window.sessionStorage.setItem(sessionStorageKey, JSON.stringify({
                [authorizeEndpoint]: js
            }));
        }
        else
        {
            const parsed = JSON.parse(state) as Dictionary<TokenStateJSON>;
            parsed[authorizeEndpoint] = js;
            window.sessionStorage.setItem(sessionStorageKey, JSON.stringify(parsed));
        }
    }

    //State
    private _tokenIssued: Property<TokenIssuedData>;
}