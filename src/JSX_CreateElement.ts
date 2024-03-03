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
import { Instantiatable } from "acts-util-core";

import { Component } from "./Component";

function RedirectProperties(tagName: string, sourceProperties: any)
{
    const attributes: any = {};
    let destProperties: any = null;

    if( (sourceProperties !== null) && (sourceProperties !== undefined) )
    {
        destProperties = {};

        for (const key in sourceProperties)
        {
            if (Object.prototype.hasOwnProperty.call(sourceProperties, key))
            {
                const value = sourceProperties[key];

                switch(tagName)
                {
                    case "td":
                    case "th":
                    {
                        switch(key)
                        {
                            case "colSpan":
                            case "rowSpan":
                                attributes[key] = value;
                                break;
                        }
                    }
                    break;
                    default:
                        //TODO: classify per tag name
                        switch(key)
                        {
                            case "allowFullscreen":
                                if(value)
                                    destProperties[key] = true;
                                break;
                            case "checked":
                            case "disabled":
                                if(value)
                                    destProperties[key] = key;
                                break;
                            case "role":
                                attributes[key] = value;
                                break;
                            default:
                                if(key.startsWith("data-"))
                                    attributes[key] = value;
                                else
                                    destProperties[key] = value;
                        }
                }
            }
        }
    }

    return {
        attributes,
        properties: destProperties
    };
}

export function JSX_CreateElement(type: string | Instantiatable<Component>, properties?: any, ...children: RenderValue[]): RenderElement
{
    if(typeof(type) === "string")
    {
        return {
            type,
            ...RedirectProperties(type, properties),
            children
        };
    }

    return {
        type,
        properties,
        children
    };
}