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
import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { Injectable } from "../Injector";
import { VirtualNode, RenderNode } from "../VirtualNode";

@Injectable
export class Select extends Component
{
    //Input
    input!: {
        children: VirtualNode[];
        value: string;
        onChanged: Function;
    };

    //Protected methods
    protected Render(): RenderNode
    {
        return <select value={this.input.value} onchange={this.OnKeyUp.bind(this)}>{...this.input.children}</select>;
    }

    //Event handlers
    private OnKeyUp(event: Event)
    {
        const newValue = (event.target! as HTMLSelectElement).value;
        if(this.input.value !== newValue)
            this.input.onChanged(newValue);
    }
}