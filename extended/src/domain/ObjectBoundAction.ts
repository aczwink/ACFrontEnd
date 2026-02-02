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

import { OpenAPI } from "@aczwink/acts-util-core";
import { APIResponse } from "../../../dist/RenderHelpers";

interface CustomAction<ObjectType, IdType>
{
    type: "custom";
    action: (ids: IdType, object: ObjectType) => Promise<void>;
    icon: string;
}

export interface DeleteAction<ObjectType, IdType>
{
    type: "delete";
    deleteResource: (ids: IdType, object: ObjectType) => Promise<APIResponse<void>>;
}

export interface EditAction<ObjectType, IdType>
{
    type: "edit";
    schema: OpenAPI.ObjectSchema;
    updateResource: (ids: IdType, newProperties: ObjectType, oldProperties: ObjectType, index: number) => Promise<APIResponse<void>>;
}

export type ObjectBoundAction<ObjectType, IdType> = CustomAction<ObjectType, IdType> | DeleteAction<ObjectType, IdType> | EditAction<ObjectType, IdType>;