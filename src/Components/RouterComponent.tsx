/**
 * ACFrontEnd
 * Copyright (C) 2019-2023 Amir Czwink (amir130@hotmail.de)
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
import { Injector, ResolutionStrategy, Subscription } from "acts-util-core";

import { Component } from "../Component";
import { Router } from "../Services/Router/Router";
import { Injectable } from "../ComponentManager";
import { RouterStateNode } from "../Services/Router/RouterState";

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
    protected Render(): RenderValue
    {        
        if(this.component === null)
            return null;
        return this.component;
    }

    //Private members
    private component: SingleRenderValue | null;
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
    public override OnInitiated()
    {
        this.OnRouterStateChanged();
        this.subscription = this.router.state.Subscribe(this.OnRouterStateChanged.bind(this));
    }

    private OnRouterStateChanged()
    {
        const routerStateNode = this.injector.TryResolve(RouterStateNode, ResolutionStrategy.ParentUpwards);
        if(routerStateNode === undefined)
        {
            this.component = null;
            this.injector.RegisterInstance(RouterStateNode, null);
            return;
        }

        const node = this.FindComponentNode(routerStateNode);
        if(node === null)
        {
            this.component = null;
            this.injector.RegisterInstance(RouterStateNode, null);
        }
        else
        {
            const component = node.route.component;
            if((component === undefined))
                this.component = null;
            else
            {
                if(("type" in component) && (typeof component !== "string"))
                    this.component = component;
                else
                {
                    this.component = {
                        type: component,
                        properties: null,
                        children: []
                    };
                }
            }
            this.injector.RegisterInstance(RouterStateNode, node.child || null);
        }

        this.Update();
    }

    override OnUnmounted()
    {
        this.subscription?.Unsubscribe();
    }
}