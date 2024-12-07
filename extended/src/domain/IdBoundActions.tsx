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

import { Dictionary, OpenAPI } from "acts-util-core";
import { Anchor, APIResponse, BootstrapIcon, JSX_CreateElement, RootInjector, RouterState } from "acfrontend";
import { APIResponseHandler } from "../main";

interface IdBoundActivateAction<IdType>
{
    type: "activate";
    execute: (ids: IdType) => Promise<APIResponse<void>>;
    icon: string;
    title: string;
}

interface IdBoundConfirmAction<IdType>
{
    type: "confirm";
    confirmText: string;
    execute: (ids: IdType) => Promise<APIResponse<void>>;
    icon: string;
    title: string;
}

interface ManagedCustomEditResourceAction<IdType, ObjectType>
{
    type: "custom_edit";
    key: string;
    title: string;
    icon: string;
    loadContext?: (ids: IdType) => Promise<object>;
    requestObject: (ids: IdType) => Promise<APIResponse<ObjectType>>;
    schema: OpenAPI.ObjectSchema;
    updateResource: (ids: IdType, properties: ObjectType) => Promise<APIResponse<void>>;
}

interface ManagedDeleteObjectAction<IdType>
{
    type: "delete";
    deleteResource: (ids: IdType) => Promise<APIResponse<void>>;
}

interface ManagedEditResourceAction<IdType, ObjectType>
{
    type: "edit";
    loadContext?: (ids: IdType) => Promise<object>;
    requestObject: (ids: IdType) => Promise<APIResponse<ObjectType>>;
    schema: OpenAPI.ObjectSchema;
    updateResource: (ids: IdType, properties: ObjectType) => Promise<APIResponse<void>>;
}

export type IdBoundObjectAction<IdType, PropertiesType> =
    IdBoundActivateAction<IdType>
    | IdBoundConfirmAction<IdType>
    | ManagedCustomEditResourceAction<IdType, PropertiesType>
    | ManagedDeleteObjectAction<IdType>
    | ManagedEditResourceAction<IdType, PropertiesType>;

export function RenderBoundAction(baseRoute: string, routeParams: Dictionary<string>, action: IdBoundObjectAction<any, any>, reloadData: (beginOrFinish: boolean) => void)
{
    const varRoute = baseRoute + "/" + (action.type === "custom_edit" ? action.key : action.type);
    const route = RouterState.ReplaceRouteParams(varRoute, routeParams).join("/");
    switch(action.type)
    {
        case "activate":
            async function ExecuteAction(action: IdBoundActivateAction<any>)
            {
                reloadData(true);
                RootInjector.Resolve(APIResponseHandler).ShowErrorMessageOnErrorFromResponse(await action.execute(routeParams));
                reloadData(false);
            }
            return <a onclick={ExecuteAction.bind(undefined, action)} role="button" className="d-flex align-items-center text-decoration-none"><BootstrapIcon>{action.icon}</BootstrapIcon> {action.title}</a>;

        case "confirm":
            async function ConfirmAction(action: IdBoundConfirmAction<any>)
            {
                reloadData(true);
                if(confirm(action.confirmText))
                    RootInjector.Resolve(APIResponseHandler).ShowErrorMessageOnErrorFromResponse(await action.execute(routeParams));
                reloadData(false);
            }
            return <a onclick={ConfirmAction.bind(undefined, action)} role="button" className="d-flex align-items-center text-decoration-none"><BootstrapIcon>{action.icon}</BootstrapIcon> {action.title}</a>;

        case "custom_edit":
            return <Anchor className="d-flex align-items-center text-decoration-none" route={route}><BootstrapIcon>{action.icon}</BootstrapIcon> {action.title}</Anchor>;

        case "delete":
            return <Anchor className="d-flex align-items-center text-decoration-none link-danger" route={route}><BootstrapIcon>trash</BootstrapIcon> Delete</Anchor>;

        case "edit":
            return <Anchor className="d-flex align-items-center text-decoration-none" route={route}><BootstrapIcon>pencil</BootstrapIcon> Edit</Anchor>;
    }
}