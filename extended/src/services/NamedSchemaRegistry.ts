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

import { Dictionary, OpenAPI, OpenAPIDefaultObjectCreator } from "acts-util-core";
import { Injectable } from "acfrontend";

@Injectable
export class NamedSchemaRegistry
{
    constructor()
    {
        this.schemas = {};
    }

    //Properties
    public get root(): OpenAPI.Root
    {
        return {
            components: {
                schemas: this.schemas,
                securitySchemes: {}
            },
            info: {
                title: "",
                version: ""
            },
            openapi: "3.1.0",
            paths: {}
        };
    }

    //Public methods
    public CreateDefault(schema: OpenAPI.Schema)
    {
        const creator = new OpenAPIDefaultObjectCreator(this.root);
        return creator.Create(schema);
    }
    
    public GetSchema(name: string)
    {
        return this.schemas[name]!;
    }

    public RegisterSchemas(schemas: Dictionary<OpenAPI.Schema>)
    {
        for (const key in schemas)
        {
            if (Object.prototype.hasOwnProperty.call(schemas, key))
            {
                const schema = schemas[key];
                this.schemas[key] = schema;
            }
        }
    }

    public ResolveReference(reference: OpenAPI.Reference): OpenAPI.Schema | OpenAPI.Reference
    {
        const last = reference.$ref.split("/").pop();
        return this.GetSchema(last!);
    }

    public ResolveSchemaOrReference(schemaOrRef: OpenAPI.Schema | OpenAPI.Reference): OpenAPI.Schema
    {
        if("$ref" in schemaOrRef)
            return this.ResolveSchemaOrReference(this.ResolveReference(schemaOrRef));
        return schemaOrRef;
    }

    //State
    private schemas: Dictionary<OpenAPI.Schema>;
}