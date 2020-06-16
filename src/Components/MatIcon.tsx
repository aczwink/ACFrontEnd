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
import { RenderText, RenderNode } from "../VirtualNode";

@Injectable
export class MatIcon extends Component
{
    //Input
    input!: {
        children: RenderText;
        class?: string;
    };

    //Protected methods
    protected Render(): RenderNode
    {
        const additionalClasses = this.input.class === undefined ? "" : " " + this.input.class;
        return <div class={"material-icons" + additionalClasses}>{this.input.children}</div>;
    }
}