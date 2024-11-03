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

import { Dictionary } from "acts-util-core";
import { Anchor, APIResponse, BootstrapIcon, JSX_CreateElement, RouterState } from "acfrontend";

interface ManagedDeleteObjectAction<IdType>
{
    type: "delete";
    deleteResource: (ids: IdType) => Promise<APIResponse<void>>;
}

export type IdBoundObjectAction<IdType, PropertiesType> =
    ManagedDeleteObjectAction<IdType>;

export function RenderBoundAction(baseRoute: string, routeParams: Dictionary<string>, action: IdBoundObjectAction<any, any>, reloadData: (beginOrFinish: boolean) => void)
{
    //const varRoute = baseRoute + "/" + (action.type === "custom_edit" ? action.key : action.type);
    const varRoute = baseRoute + "/" + action.type;
    const route = RouterState.ReplaceRouteParams(varRoute, routeParams).join("/");
    switch(action.type)
    {
        case "delete":
            return <Anchor className="d-flex align-items-center text-decoration-none link-danger" route={route}><BootstrapIcon>trash</BootstrapIcon> Delete</Anchor>;
    }
}