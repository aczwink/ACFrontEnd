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

import { JSX_CreateElement, RootInjector } from "acfrontend";
import { ObjectExtensions, OpenAPI } from "acts-util-core";
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
    {
        const discriminatorPropName = schema.discriminator!.propertyName;
        const discriminator: string = value[discriminatorPropName];

        function ExtractKeys(schema: OpenAPI.ObjectSchema)
        {
            const x = schema.properties[discriminatorPropName] as OpenAPI.StringSchema;
            return x.enum!;
        }

        const matchedSchema = schema.oneOf.Values()
            .Map(x => apiSchemaService.ResolveSchemaOrReference(x) as OpenAPI.ObjectSchema)
            .Filter(x => ExtractKeys(x).Contains(discriminator))
            .First();

        return RenderReadOnlyValue(value, matchedSchema);
    }

    switch(schema.type)
    {
        case "array":
            const childSchema = apiSchemaService.ResolveSchemaOrReference(schema.items);
            return <ol>{value.map( (x: any) => <li>{RenderReadOnlyValue(x, childSchema)}</li>)}</ol>;
            
        case "boolean":
            return <div className="form-check">
                <input className="form-check-input" type="checkbox" value="" checked={value} disabled />
            </div>;
            
        case "number":
            if(schema.format !== undefined)
            {
                const cfm = RootInjector.Resolve(CustomFormatRegistry);
                if(cfm.HasFormatEntry("number", true, schema.format))
                    return cfm.Present("number", schema.format, value);
            }

            return RenderNumber(value, schema);

        case "object":
            return <table>
                <tr>
                    <th>Key</th>
                    <th>Value</th>
                </tr>
                {ObjectExtensions.Entries(value).Map( (kv: any) => <tr>
                    <td>{kv.key}</td>
                    <td>{RenderReadOnlyValue(kv.value, RootInjector.Resolve(NamedSchemaRegistry).ResolveSchemaOrReference(schema.properties[kv.key]!))}</td>
                </tr>).ToArray()}
            </table>;

        case "string":
        {
            if(schema.format !== undefined)
            {
                switch(schema.format)
                {
                    case "date-time":
                        return new Date(value).toLocaleString();
                }
                switch(schema.format as string)
                {
                    case "multi-line":
                        return <textarea className="form-control" cols="80" readOnly rows="12">{value}</textarea>;
                    case "secret":
                        return <input className="form-control" type="password" value={value} disabled />;
                }

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