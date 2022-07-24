/**
 * ACFrontEnd
 * Copyright (C) 2020-2022 Amir Czwink (amir130@hotmail.de)
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
import { Injectable } from "../ComponentManager";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { Router } from "../Services/Router/Router";
import { Anchor } from "./Anchor";

@Injectable
export class NavItem extends Component<{ route: string }, RenderValue>
{
    constructor(private router: Router)
    {
        super();
    }

    protected Render(): RenderValue
    {
        const routerUrl = this.router.state.Get().ToUrl();

        const isActive = this.input.route === "/" ? routerUrl.path === this.input.route : routerUrl.path.startsWith(this.input.route);
        const className = "nav-link" + (isActive ? " active" : "");
        return <li><Anchor class={className} route={this.input.route}>{...this.children}</Anchor></li>;
    }

    //Event handlers
    public override OnInitiated()
    {
        this.router.state.Subscribe(this.OnRouterStateChanged.bind(this));
    }

    private OnRouterStateChanged()
    {
        this.Update();
    }
}

export class Navigation extends Component<{}, RenderValue>
{
    protected Render(): RenderValue
    {
        return <div className="container">
            <nav className="d-flex justify-content-between align-items-center">{...this.children}</nav>
        </div>;
    }
}