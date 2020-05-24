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
import { Instantiatable, Injector, ResolutionStrategy } from "acts-util-core";

import { Component } from "../Component";
import { Router } from "../Services/Router/Router";
import { Injectable } from "../ComponentManager";
import { VirtualInstance } from "../VirtualInstance";
import { RouterStateNode } from "../Services/Router/RouterState";
import { RenderNode } from "../VirtualNode";
import { Subscription } from "acts-util-core/dist/Observable";

@Injectable
export class RouterComponent extends Component
{
    //Constructor
    constructor(private router: Router, private injector: Injector)
    {
        super();

        this.component = null;
    }

    //Protected methods
    protected Render(): RenderNode
    {        
        if(this.component === null)
            return null;
        return new VirtualInstance(this.component, null, []);
    }

    //Private members
    private component: Instantiatable<Component> | null;
    private subscription?: Subscription;

    //Private methods
    private FindComponentNode(node: RouterStateNode | null): RouterStateNode | null
    {
        if(node === null)
            return null;

        if(node.route.component !== undefined)
            return node;
        if(node.child !== undefined)
            return this.FindComponentNode(node.child);
        return null;
    }

    //Event handlers
    public OnInitiated()
    {
        this.OnRouterStateChanged();
        this.subscription = this.router.state.Subscribe(this.OnRouterStateChanged.bind(this));
    }

    private OnRouterStateChanged()
    {
        const routerStateNode = this.injector.Resolve(RouterStateNode, ResolutionStrategy.ParentUpwards);
        console.log(routerStateNode);

        const node = this.FindComponentNode(routerStateNode);
        if(node === null)
            this.injector.RegisterInstance(RouterStateNode, null);
        else
        {
            this.component = node.route.component || null;
            this.injector.RegisterInstance(RouterStateNode, node.child || null);
        }

        this.Update();
    }

    public OnUnmounted()
    {
        this.subscription?.Unsubscribe();
    }
}