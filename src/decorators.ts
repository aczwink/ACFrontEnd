/**
 * ACFrontEnd
 * Copyright (C) 2019-2025 Amir Czwink (amir130@hotmail.de)
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
import { Dictionary } from "acts-util-core";
import { RootInjector } from "./App";
import { GetConstructorMetadata } from "./metadata";

export interface ClassComponentMemberMetadata
{
    installDataBinding: boolean;
}

export function DontBind(target: any, key: string)
{
    if(target.__members === undefined)
        target.__members = {};
    if(target.__members === Object.getPrototypeOf(target).__members)
    {
        target.__members = {};
        Object.assign(target.__members, Object.getPrototypeOf(target).__members);
    }
    const members: Dictionary<ClassComponentMemberMetadata> = target.__members;

    members[key] = { installDataBinding: false };
}

export function Injectable<T extends Instantiatable<{}>>(constructor:T)
{
    RootInjector.RegisterProvider(constructor, constructor);
    return constructor;
}

export function RouteParamProperty(property: string)
{
    return function(target: any, propertyKey: undefined, parameterIndex: number)
    {
        const md = GetConstructorMetadata(target);
        md[parameterIndex] = {
            type: "route-param",
            name: property
        };
    };
}