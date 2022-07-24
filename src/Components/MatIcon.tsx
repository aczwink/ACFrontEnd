/**
 * ACFrontEnd
 * Copyright (C) 2019-2020,2022 Amir Czwink (amir130@hotmail.de)
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

@Injectable
export class MatIcon extends Component<{ className?: string; }, RenderText>
{
    //Protected methods
    protected Render(): RenderValue
    {
        const additionalClasses = this.input.className === undefined ? "" : " " + this.input.className;
        return <div className={"material-icons" + additionalClasses}>{this.children}</div>;
    }
}