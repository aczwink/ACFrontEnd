/**
 * ACFrontEnd
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
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

function MoveProperty(properties: any, fromKey: string, toKey: string)
{
    if(fromKey in properties)
    {
        properties[toKey] = properties[fromKey];
        delete properties[fromKey];
    }
}

function SetPropertyOnBool(properties: any, key: string, valueOnTrue: any = key)
{
    if(key in properties)
    {
        if(properties[key])
            properties[key] = valueOnTrue;
        else
            delete properties[key];
    }
}

function SetPropertyOnBoolAndMove(properties: any, fromKey: string, toKey: string, valueOnTrue: any)
{
    if(fromKey in properties)
    {
        if(properties[fromKey])
            properties[toKey] = valueOnTrue;
        delete properties[fromKey];
    }
}

function RedirectProperties(properties: any)
{
    if( (properties !== null) && (properties !== undefined) )
    {
        SetPropertyOnBoolAndMove(properties, "allowfullscreen", "allowFullscreen", true);
        SetPropertyOnBool(properties, "checked");
        MoveProperty(properties, "class", "className");
        MoveProperty(properties, "colspan", "colSpan");
        SetPropertyOnBool(properties, "disabled");
        MoveProperty(properties, "readonly", "readOnly");
        MoveProperty(properties, "tabindex", "tabIndex");
    }
    return properties;
}

export function JSX_CreateElement(type: string | Instantiatable<Component>, properties?: any, ...children: RenderValue[]): SingleRenderValue
{
    return {
        type,
        properties: typeof(type) === "string" ? RedirectProperties(properties) : properties,
        children
    };
}