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
import { Injectable } from "../ComponentManager";

@Injectable
export class RouterButton extends Component<{ className?: string; route: string; }, RenderValue>
{
    //Constructor
    constructor(private router: Router)
    {
        super();
    }

    //Protected methods
    protected Render(): RenderValue
    {
        return <button className={"btn " + this.input.className} type="button" onclick={this.OnActivated.bind(this)}>{this.children}</button>;
    }

    //Event handlers
    private OnActivated(event: Event)
    {        
        this.router.RouteTo(this.input.route);
    }
}