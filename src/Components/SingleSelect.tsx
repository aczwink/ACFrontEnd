/**
 * ACFrontEnd
 * Copyright (C) 2022 Amir Czwink (amir130@hotmail.de)
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

interface SingleSelectInput
{
    selectedIndex: number;
    onSelectionChanged: (newIndex: number) => void;
}

export class SingleSelect extends Component<SingleSelectInput, RenderValue>
{
    protected Render(): RenderValue
    {
        return <div className="dropdown">
            <button className="form-select" type="button" data-bs-toggle="dropdown" aria-expanded="false">{this.children[this.input.selectedIndex]}</button>
            <ul className="dropdown-menu">{this.children.map(this.RenderItem.bind(this))}</ul>
        </div>;
    }

    //Private methods
    private RenderItem(child: RenderValue, index: number)
    {
        const className = "dropdown-item" + (index === this.input.selectedIndex ? " active" : "");
        return <li><button className={className} type="button" onclick={() => this.input.onSelectionChanged(index)}>{child}</button></li>;
    }
}