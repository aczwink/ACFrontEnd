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

import { Component, RenderComponentChild, RenderComponentChildWithChildrenHelp } from "../Component";
import { Injectable } from "../ComponentManager";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { Url } from "../Model/Url";
import { Router } from "../Services/Router/Router";
import { RouterState } from "../Services/Router/RouterState";
import { Anchor } from "./Anchor";

@Injectable
export class NavigationGroup extends Component<{}, RenderComponentChildWithChildrenHelp<Anchor, RenderValue>[]>
{
    constructor(private router: Router)
    {
        super();
    }
    
    protected Render(): RenderValue
    {
        const routerUrl = this.router.state.Get().ToUrl();
        return <ul>
            {...this.children.map(this.RenderChild.bind(this, routerUrl))}
        </ul>;
    }

    //Private methods
    private RenderChild(routerUrl: Url, child: RenderComponentChild<Anchor>)
    {
        const ownUrl = RouterState.CreateAbsoluteUrl(child.properties.route);
        const className = routerUrl.Equals(ownUrl) ? "active" : undefined;

        return <li class={className}>{child}</li>;
    }

    //Event handlers
    public OnInitiated()
    {
        this.router.state.Subscribe(this.OnRouterStateChanged.bind(this));
    }

    private OnRouterStateChanged()
    {
        this.Update();
    }
}

export class Navigation extends Component<{}, RenderComponentChild<NavigationGroup>[]>
{
    protected Render(): RenderValue
    {
        return <nav>{...this.children}</nav>;
    }
}