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

import { APIResponse, Component, RouteGuard } from "acfrontend";
import { OpenAPI } from "@aczwink/acts-util-core";
import { IdBoundObjectAction } from "./IdBoundActions";
import { ObjectBoundAction } from "./ObjectBoundAction";

export interface CollectionContentSetup<ObjectType, IdType>
{
    type: "collection";
    actions?: RouteSetup<any, any>[];
    child: RouteSetup<any, any>;
    id: (keyof ObjectType) | ((object: ObjectType) => string);
    requestObjects: (ids: IdType) => Promise<APIResponse<ObjectType[]>>;
    schema?: OpenAPI.ObjectSchema;
}

export interface ComponentContentSetup
{
    type: "component";
    component: Instantiatable<Component<null | {}>>;
}

export interface CreateContentSetup<ObjectType, IdType>
{
    type: "create";
    call: (ids: IdType, data: ObjectType) => Promise<APIResponse<number | string | void>>;
    loadContext?: (ids: IdType) => Promise<object>;
    schema: OpenAPI.ObjectSchema;
}

export interface ElementViewModel<IdType>
{
    type: "element";
    element: (ids: IdType) => RenderElement;
}

interface PageGroupEntry
{
    displayName: string;
    entries: RouteSetup<any, any>[];
}

export interface ListContentSetup<ObjectType, IdType>
{
    type: "list";
    actions?: RouteSetup<any, any>[];
    boundActions?: ObjectBoundAction<ObjectType, IdType>[];
    requestObjects: (ids: IdType) => Promise<APIResponse<ObjectType[]>>;
    schema?: OpenAPI.ObjectSchema | OpenAPI.OneOfSchema;
}

export interface MultiPageContentSetup<IdType>
{
    type: "multiPage";
    actions: IdBoundObjectAction<IdType, any>[];
    entries: PageGroupEntry[];
    formTitle: (ids: IdType) => string;
}

export interface ObjectContentSetup<ObjectType, IdType>
{
    type: "object";
    actions: IdBoundObjectAction<IdType, ObjectType>[];
    formTitle: (ids: IdType, object: ObjectType) => string;
    requestObject: (ids: IdType) => Promise<APIResponse<ObjectType>>;
    schema: OpenAPI.ObjectSchema;
}

export interface RoutingViewModel
{
    type: "routing";

    entries: RouteSetup<any, any>[];
}

type ContentSetup<IdType, ContentType = null> = CollectionContentSetup<ContentType, IdType> | ComponentContentSetup | CreateContentSetup<ContentType, IdType> | ElementViewModel<IdType> | ListContentSetup<ContentType, IdType> | MultiPageContentSetup<IdType> | ObjectContentSetup<ContentType, IdType> | RoutingViewModel;

export interface RouteSetup<IdType = {}, ContentType = {}>
{
    content: ContentSetup<IdType, ContentType>;
    displayText: string;
    guards?: (RouteGuard | Instantiatable<RouteGuard>)[];
    icon: string;
    requiredScopes?: string[];
    routingKey: string;
}