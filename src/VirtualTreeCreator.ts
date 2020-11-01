/**
 * ACFrontEnd
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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
import { VirtualTextNode } from "./VirtualTextNode";
import { Component } from "./Component";
import { VirtualConstNode } from "./VirtualConstNode";
import { VirtualElement } from "./VirtualElement";
import { VirtualFragment } from "./VirtualFragment";
import { VirtualInstance } from "./VirtualInstance";
import { Instantiatable } from "acts-util-core";

class VirtualTreeCreator
{
    //Public methods
    public TransformRenderValueToVirtualNode(renderValue: RenderValue): VirtualNode | null
    {
        if( (renderValue === null) || (renderValue === undefined) )
            return null;

        if(Array.isArray(renderValue))
            return new VirtualFragment(this.TransformArray(renderValue));

        if((typeof renderValue === "string") || (typeof renderValue === "number") || (typeof renderValue === "boolean"))
            return new VirtualTextNode(renderValue);
        
        if(typeof(renderValue.type) == "string")
        {
            if(renderValue.type == "const")
            {
                const vNode = new VirtualConstNode();
                vNode.children = this.TransformArray(renderValue.children);
                return vNode;
            }

            if(renderValue.type == "fragment")
            {
                const vNode =  new VirtualFragment(this.TransformArray(renderValue.children));
                return vNode;
            }
            
            const vNode = new VirtualElement(renderValue.type, renderValue.properties, this.TransformArray(renderValue.children));
            return vNode;
        }

        return new VirtualInstance(renderValue.type as unknown as Instantiatable<Component<any, RenderValue[]>>, renderValue.properties, renderValue.children);
    }

    //Private methods
    private TransformArray(renderValue: RenderValue[])
    {
        return renderValue.map(child => this.TransformRenderValueToVirtualNode(child)).filter(child => child !== null) as VirtualNode[];
    }
}

export function TransformRenderValueToVirtualNode(renderValue: RenderValue)
{
    const instance = new VirtualTreeCreator();
    return instance.TransformRenderValueToVirtualNode(renderValue);
}