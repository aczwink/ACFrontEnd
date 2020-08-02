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
import { RenderNode, VirtualNode } from "./VirtualNode";
import { VirtualTextNode } from "./VirtualTextNode";
import { VirtualFragment } from "./VirtualFragment";

export function TransformRenderNodeToVirtualNode(renderNode: RenderNode, cloneVNodes: boolean = false): VirtualNode | null
{
    if( (renderNode === undefined) || (renderNode === null) )
        return null;

    if((typeof renderNode === "string") || (typeof renderNode === "number") || (typeof renderNode === "boolean"))
        return new VirtualTextNode(renderNode);
        
    if(Array.isArray(renderNode))
        return new VirtualFragment( TransformChildren(renderNode, cloneVNodes) );
        
    return cloneVNodes ? renderNode.Clone() : renderNode;
}

export function TransformChildren(children: RenderNode[], cloneVNodes: boolean = false): VirtualNode[]
{
    return children.map(child => TransformRenderNodeToVirtualNode(child, cloneVNodes)).filter(child => child !== null) as VirtualNode[];
}