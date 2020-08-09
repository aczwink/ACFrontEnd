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
import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { Injectable } from "../ComponentManager";
import { RenderNode } from "../VirtualNode";
import { VirtualNode } from "../main";
import { VirtualInstance } from "../VirtualInstance";

type StackChildInput = { key: string; };
export class StackChild extends Component<StackChildInput, VirtualNode>
{
    //Protected methods
    protected Render(): RenderNode
    {
        return this.children[0];
    }
}

@Injectable
export class Stack extends Component<{ activeKey: string; }, VirtualInstance<StackChild, StackChildInput, VirtualNode>[]>
{
    //Protected methods
    protected Render(): RenderNode
    {
        return <const>{this.FindActiveChild()}</const>;
    }

    //Private methods
    private FindActiveChild()
    {
        return this.children.find( child => child.input.key === this.input.activeKey );
    }
}