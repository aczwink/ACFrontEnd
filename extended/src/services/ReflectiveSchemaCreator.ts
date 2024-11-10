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

import { Injectable } from "acfrontend";
import { ObjectExtensions, OpenAPI } from "acts-util-core";

@Injectable
export class ReflectiveSchemaCreator
{
    public Create<T extends object>(data: T[]): OpenAPI.ArraySchema
    {
        if(data.length === 0)
        {
            return {
                type: "array",
                items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {},
                    required: []
                }
            };
        }
        return {
            type: "array",
            items: {
                type: "object",
                properties: data.Values().Map(x => ObjectExtensions.Entries(x)).Flatten().ToDictionary(kv => kv.key as string, kv => this.CreatePropertySchema(kv.value)),
                required: data.Values().Map(x => ObjectExtensions.OwnKeys(x).ToSet() as Set<string>).Accumulate((x, y) => x.Intersect(y)).ToArray(),
                additionalProperties: false
            }
        };
    }

    private CreatePropertySchema<T>(value: T): OpenAPI.Schema | OpenAPI.Reference
    {
        switch(typeof value)
        {
            case "number":
                return {
                    type: "number"
                };

            case "object":
                if(value === null)
                {
                    return {
                        type: "'null'"
                    };
                }
                return {
                    type: "object",
                    additionalProperties: false,
                    properties: ObjectExtensions.Entries(value).ToDictionary(kv => kv.key as string, kv => this.CreatePropertySchema(kv.value)),
                    required: ObjectExtensions.OwnKeys(value).ToArray() as string[],
                };

            case "string":
                return {
                    type: "string",
                };

            default:
                throw new Error("TODO: not implemented for" + typeof value);
        }
    }
}