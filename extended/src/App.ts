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
import { BootstrapApp as acfrontendBootstrapApp, OAuth2Config, RootInjector } from "acfrontend";
import { RootComponent } from "./components/RootComponent";
import { RouteSetup } from "./domain/declarations";
import { RoutingManager } from "./services/RoutingManager";
import { FeaturesManager } from "./services/FeaturesManager";

interface AppProperties
{
    features: {
        oAuth2?: OAuth2Config;
        OIDC?: boolean;
    };
    mountPoint: HTMLElement;
    routes: RouteSetup<any, any>[];
    title: string;
    version: string;
}

export function BootstrapApp(properties: AppProperties)
{
    const fm = RootInjector.Resolve(FeaturesManager);
    if(properties.features.oAuth2 !== undefined)
        fm.oAuth2Config = properties.features.oAuth2;
    fm.OIDC = properties.features.OIDC === true;

    const rm = RootInjector.Resolve(RoutingManager);
    properties.routes.forEach(x => rm.RegisterRootRouteSetup(x));

    acfrontendBootstrapApp({
        mountPoint: properties.mountPoint,
        rootComponentClass: RootComponent,
        routes: rm.BuildAppRoutes(),
        title: properties.title,
        version: properties.version
    });
}