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
import { RootInjector } from "../../App";
import { VirtualNode } from "../../VirtualTree/VirtualNode";
import { InfoMessageManager } from "../InfoMessageManager";
import { OAuth2Service } from "../OAuth2Service";
import { OAuth2Config } from "../OAuth2TokenManager";
import { RouteGuard } from "./RouteGuard";
import { Router } from "./Router";
import { RouterState } from "./RouterState";

interface OAuth2GuardInput
{
    config: OAuth2Config;
    scopes: string[];
}

export class OAuth2Guard implements RouteGuard
{
    constructor(private input: OAuth2GuardInput)
    {
    }

    public CanActivate(): boolean
    {
        return RootInjector.Resolve(OAuth2Service).RequestScopes(this.input.config, this.input.scopes);
    }

    public OnActivationFailure(routerState: RouterState): void
    {
        if(RootInjector.TryResolve(VirtualNode as any) === undefined) //check root node
            RootInjector.Resolve(Router).RouteTo("/accessdenied");
        else
        {
            RootInjector.Resolve(InfoMessageManager).ShowMessage("Access denied.", {
                type: "danger"
            });
        }
    }
}