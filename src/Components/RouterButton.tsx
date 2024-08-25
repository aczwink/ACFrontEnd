/**
 * ACFrontEnd
 * Copyright (C) 2020-2024 Amir Czwink (amir130@hotmail.de)
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
import { Router } from "../Services/Router/Router";
import { BootstrapColor } from "../Bootstrap";
import { Injectable } from "../decorators";

interface RouterButtonInput
{
    className?: string;
    color: BootstrapColor;
    route: string;
}

@Injectable
export class RouterButton extends Component<RouterButtonInput, RenderValue>
{
    //Constructor
    constructor(private router: Router)
    {
        super();
    }

    //Protected methods
    protected Render(): RenderValue
    {
        const className = this.input.className === undefined ? "" : (" " + this.input.className);
        return <a className={"btn btn-" + this.input.color + className} href={this.input.route} onclick={this.OnActivated.bind(this)}>{this.children}</a>;
    }

    //Event handlers
    private OnActivated(event: Event)
    {
        event.preventDefault();
        this.router.RouteTo(this.input.route);
    }
}