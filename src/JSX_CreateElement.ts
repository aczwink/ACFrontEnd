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
import { Instantiatable } from "@aczwink/acts-util-core";

import { Component } from "./Component";

enum KeyType
{
    Attribute = 0,
    Property = 1,
    Skip = 2,
}

function RedirectPropertiesElement(tagName: string, key: string, value: boolean): KeyType | { type: KeyType; value: boolean | string; }
{
    if(key.startsWith("data-"))
        return KeyType.Attribute;
    
    switch(tagName)
    {
        case "input":
            switch(key)
            {
                case "checked":
                    if(value)
                        return { type: KeyType.Attribute, value: key };
                    return KeyType.Skip;
                case "maxLength":
                case "placeholder":
                    return KeyType.Attribute;
            }
        break;
        case "td":
        case "th":
            switch(key)
            {
                case "colSpan":
                case "rowSpan":
                    return KeyType.Attribute;
            }
        break;
        default:
            //TODO: classify per tag name
            switch(key)
            {
                case "allowFullscreen":
                    if(value)
                        return { type: KeyType.Property, value: true };
                    break;
                case "disabled":
                    if(value)
                        return { type: KeyType.Property, value: key };
                    break;
                case "role":
                    return KeyType.Attribute;
                default:
                    return KeyType.Property;
            }
    }
    return KeyType.Property;
}

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

                const result = RedirectPropertiesElement(tagName, key, value);
                const keyType = (typeof result === "object") ? result.type : result;
                const destValue = (typeof result === "object") ? result.value : value;
                switch(keyType)
                {
                    case KeyType.Attribute:
                        attributes[key.toLowerCase()] = destValue;
                        break;
                    case KeyType.Property:
                        destProperties[key] = destValue;
                        break;
                    case KeyType.Skip:
                        break;
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

export const JSX_Fragment = "fragment";