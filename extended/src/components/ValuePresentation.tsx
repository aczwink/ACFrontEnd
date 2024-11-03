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

import { RootInjector } from "acfrontend";
import { OpenAPI } from "acts-util-core";
import { NamedSchemaRegistry } from "../services/NamedSchemaRegistry";
import { CustomFormatRegistry } from "../services/CustomFormatRegistry";

function RenderNumber(value: number, schema: OpenAPI.NumberSchema)
{
    switch(schema.format)
    {
        case "byteSize":
            return value.FormatBinaryPrefixed("B");
    }
    return value;
}

export function RenderReadOnlyValue(value: any, schemaOrRef: OpenAPI.Schema | OpenAPI.Reference): SingleRenderValue
{
    const apiSchemaService = RootInjector.Resolve(NamedSchemaRegistry);
    const schema = apiSchemaService.ResolveSchemaOrReference(schemaOrRef);

    if("anyOf" in schema)
        throw new Error("anyof not implemented");
    if("oneOf" in schema)
        throw new Error("anyof not implemented");

    switch(schema.type)
    {
        case "number":
            if(schema.format !== undefined)
            {
                const cfm = RootInjector.Resolve(CustomFormatRegistry);
                if(cfm.HasFormatEntry("number", true, schema.format))
                    return cfm.Present("number", schema.format, value);
            }

            return RenderNumber(value, schema);

        case "string":
        {
            if(schema.format !== undefined)
            {
                const cfm = RootInjector.Resolve(CustomFormatRegistry);
                if(cfm.HasFormatEntry("string", true, schema.format))
                    return cfm.Present("string", schema.format, value);
            }
            return value;
        }

        default:
            throw new Error(schema.type + " not implemented");
    }
}

export function RenderTitle(schema: OpenAPI.Schema | OpenAPI.Reference, fallback: string)
{
    if("anyOf" in schema)
        return fallback;
    if("oneOf" in schema)
        return fallback;
    return schema.title || fallback;
}