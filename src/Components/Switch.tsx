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
import { RenderNode } from "../VirtualNode";
import { JSX_CreateElement } from "../JSX_CreateElement";

export class Switch extends Component
{
    input!: {
        checked: boolean;
        onChanged: (newValue: boolean) => void;
    };

    protected Render(): RenderNode
    {
        return <label class="switch">
            <input type="checkbox" checked={this.input.checked} onclick={this.OnToggled.bind(this)} />
            <span></span>
        </label>;
    }

    //Event handlers
    private OnToggled(event: Event)
    {
        const newValue = (event.target! as HTMLInputElement).checked;
        this.input.onChanged(newValue);
    }
}