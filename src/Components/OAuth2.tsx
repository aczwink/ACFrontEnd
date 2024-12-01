/**
 * ACFrontEnd
 * Copyright (C) 2019-2024 Amir Czwink (amir130@hotmail.de)
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
import { UseEffectOnce, Use } from "../Hooks";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { OAuth2Service } from "../Services/OAuth2Service";
import { OAuth2Config, OAuth2TokenManager } from "../Services/OAuth2TokenManager";
import { Router } from "../Services/Router/Router";
import { ProgressSpinner } from "./ProgressSpinner";

export function OAuth2LoginRedirectHandler()
{
    UseEffectOnce(async () => {
        const redirect = await Use(OAuth2Service).HandleRedirectResult();
        if(redirect !== undefined)
            Use(Router).RouteTo(redirect);
    });
    return <ProgressSpinner />;
}

export function OAuth2LogoutHandler(input: { config: OAuth2Config })
{
    UseEffectOnce(async () => {
        Use(OAuth2TokenManager).RemoveToken(input.config);
        Use(Router).RouteTo("/");
    });
    return <ProgressSpinner />;
}