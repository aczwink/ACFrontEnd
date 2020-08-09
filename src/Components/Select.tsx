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
import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { Injectable } from "../ComponentManager";
import { VirtualNode, RenderNode } from "../VirtualNode";
import { VirtualElement } from "../VirtualElement";
import { VirtualFragment } from "../VirtualFragment";

@Injectable
export class Select extends Component<{ onChanged: (newValue: string[]) => void; }, VirtualNode[]>
{
    //Protected methods
    protected Render(): RenderNode
    {
        return <select onchange={this.OnSelectionChanged.bind(this)}>
            <option disabled selected={!this.IsChildSelected(this.children)}>Select an option</option>
            {...this.children.map(child => child.Clone())}
        </select>;
    }

    //Private methods
    private IsChildSelected(children: VirtualNode[])
    {
        for (const child of children)
        {
            if(child instanceof VirtualElement)
            {
                if(child.properties.selected)
                    return true;
            }
            else if(child instanceof VirtualFragment)
            {
                if( (child.children !== undefined) && this.IsChildSelected(child.children))
                    return true;
            }
            else
                throw new Error("A select can only have option-children");
        }

        return false;
    }

    //Event handlers
    private OnSelectionChanged(event: Event)
    {
        const domNode = (event.target! as HTMLSelectElement);
        const selection = [];
        for (let index = 0; index < domNode.selectedOptions.length; index++)
        {
            const element = domNode.selectedOptions.item(index);
            selection.push(element!.value);
        }
        
        this.input.onChanged(selection);
    }
}