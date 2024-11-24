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

import { BootstrapApp } from "./App";
import { ObjectEditorComponent } from "./components/ObjectEditorComponent";
import { RouteSetup } from "./domain/declarations";
import { IdBoundObjectAction } from "./domain/IdBoundActions";
import { APIResponseHandler } from "./services/APIResponseHandler";
import { CustomFormatRegistry } from "./services/CustomFormatRegistry";
import { NamedSchemaRegistry } from "./services/NamedSchemaRegistry";
import { RoutingManager } from "./services/RoutingManager";

export function CreateOAuth2RedirectURIs(baseURL: string)
{
    return {
        redirectURI: baseURL + "/oauth2loggedin",
        postLogoutRedirectURI: baseURL + "/oauth2loggedout",
    };
}

export
{
    APIResponseHandler,
    BootstrapApp,
    CustomFormatRegistry,
    IdBoundObjectAction,
    NamedSchemaRegistry,
    ObjectEditorComponent,
    RouteSetup,
    RoutingManager,
};