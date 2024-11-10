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
import { OpenAPI } from "acts-util-core";
import { NamedSchemaRegistry } from "./services/NamedSchemaRegistry";
import { Layout, LayoutManager } from "./services/LayoutManager";

interface AppProperties
{
    additionalRoutes?: RouteSetup<any, any>[];
    features: {
        oAuth2?: OAuth2Config;
        OIDC?: boolean;
        openAPI?: OpenAPI.Root;
    };
    mountPoint: HTMLElement;
    layout: Layout;
    title: string;
    version: string;
}

export function BootstrapApp(properties: AppProperties)
{
    const fm = RootInjector.Resolve(FeaturesManager);
    if(properties.features.oAuth2 !== undefined)
        fm.oAuth2Config = properties.features.oAuth2;
    fm.OIDC = properties.features.OIDC === true;

    if(properties.features.openAPI !== undefined)
    {
        const nsr = RootInjector.Resolve(NamedSchemaRegistry);
        nsr.RegisterSchemas(properties.features.openAPI.components.schemas);
    }

    const rm = RootInjector.Resolve(RoutingManager);
    properties.layout.navbar.forEach(x => x.forEach(y => rm.RegisterRootRouteSetup(y)));
    properties.layout.user.forEach(x => rm.RegisterRootRouteSetup(x));
    properties.additionalRoutes?.forEach(x => rm.RegisterRootRouteSetup(x));

    const lm = RootInjector.Resolve(LayoutManager);
    lm.layout = properties.layout;

    acfrontendBootstrapApp({
        mountPoint: properties.mountPoint,
        rootComponentClass: RootComponent,
        routes: rm.BuildAppRoutes(),
        title: properties.title,
        version: properties.version
    });
}