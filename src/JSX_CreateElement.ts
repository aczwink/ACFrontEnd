/**
 * ACFrontEnd
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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
import { VirtualNode } from "./VirtualNode";
import { RenderNode, VirtualElement } from "./VirtualElement";
import { Component } from "./Component";
import { VirtualInstance } from "./VirtualInstance";
import { Instantiatable } from "./Injector";
import { VirtualTextNode } from "./VirtualTextNode";
import { VirtualFragment } from "./VirtualFragment";

function TransformChildren(children: RenderNode[]): VirtualNode[]
{
    return children.filter(child => child !== null).map(child => {
        if((typeof child === "string") || (typeof child === "number"))
            return new VirtualTextNode(child);
        if(Array.isArray(child))
            return new VirtualFragment(TransformChildren(child));
        return child;
    }) as VirtualNode[];
}

export function JSX_CreateElement(type: string | Instantiatable<Component> | Instantiatable<VirtualFragment>, properties?: any, ...children: RenderNode[]): VirtualNode
{
    if(typeof(type) == "string")
    {
        return new VirtualElement(type, properties, TransformChildren(children));
    }

    if(type == VirtualFragment)
    {
        return new VirtualFragment(TransformChildren(children));
    }

    return new VirtualInstance(type as Instantiatable<Component>, properties, TransformChildren(children));
}