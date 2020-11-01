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
import { Component, RenderComponentChildWithChildrenHelp } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";

export class MenuItem extends Component<{}, RenderValue>
{
    protected Render(): RenderValue
    {
        return <li>{this.children}</li>;
    }
}

export class Menu extends Component<{}, RenderComponentChildWithChildrenHelp<MenuItem, RenderValue>[]>
{
    //Protected methods
    protected Render(): RenderValue
    {
        return <ul class="menu">
            {...this.children}
        </ul>;
    }
}