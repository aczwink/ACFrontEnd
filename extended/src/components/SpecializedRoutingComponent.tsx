/**
 * ACFrontEnd
 * Copyright (C) 2019-2024 Amir Czwink (amir130@hotmail.de)
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

import { Anchor, Component, Injectable, JSX_CreateElement, Router } from "acfrontend";
import { Injector, ObjectExtensions, Subscription } from "acts-util-core";
import { RouterState, RouterStateNode } from "../../../dist/Services/Router/RouterState";
import { MultiPageNavComponent } from "./MultiPageNavComponent";

interface NavHistoryItem
{
    path: string;
    title: string;
}

@Injectable
export class MainRoutingComponent extends Component
{
    constructor(private router: Router, private injector: Injector)
    {
        super();

        this.component = null;
        this.navHistoryItems = [];
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    {(this.navHistoryItems.length <= 1) ? null : this.navHistoryItems.map(this.RenderNavHistoryEntry.bind(this))}
                </ol>
            </nav>
            {this.component}
        </fragment>;
    }

    //Private methods
    private MergeNavHistoryItems(path: string, title: string)
    {
        const idx = this.navHistoryItems.findIndex(x => x.path === path);
        if(idx === -1)
        {
            this.navHistoryItems.push({
                path,
                title
            });
        }
        else
            this.navHistoryItems = this.navHistoryItems.slice(0, idx+1);
    }
    
    private RenderNavHistoryEntry(bc: NavHistoryItem, index: number)
    {
        if(index === (this.navHistoryItems.length - 1))
            return <li className="breadcrumb-item active">{bc.title}</li>

        return <li className="breadcrumb-item"><Anchor route={bc.path}>{bc.title}</Anchor></li>
    }

    //Event handlers
    override OnInitiated(): void
    {
        this.OnRouterStateChanged();
        this.subscription = this.router.state.Subscribe(this.OnRouterStateChanged.bind(this));
    }

    private OnRouterStateChanged()
    {
        const routerState = this.router.state.Get();

        let node: RouterStateNode | undefined = routerState.root;

        const components = [];
        let path = "";
        while(node)
        {
            if(node.route.path.length > 0)
                path += "/" + node.route.path;

            if(node.route.component)
            {
                const component = node.route.component;
                if(("type" in component) && (typeof component !== "string"))
                    components.push({
                        renderValue: component,
                        path,
                        node
                    });
                else
                {
                    const rv = {
                        type: component,
                        properties: null,
                        children: []
                    };
                    components.push({
                        renderValue: rv,
                        path,
                        node
                    });
                }
            }

            node = node.child;
        }

        const prev = components[components.length - 2];
        const current = components[components.length - 1];
        if(prev?.renderValue.type === MultiPageNavComponent)
        {
            this.injector.RegisterInstance(RouterStateNode, current.node);
            this.MergeNavHistoryItems(RouterState.ReplaceRouteParams(prev.path, routerState.routeParams).join("/"), prev.renderValue.properties.formHeading(routerState.routeParams));
            this.component = components[components.length - 2].renderValue;
        }
        else
            this.component = components[components.length - 1].renderValue;

        if(!ObjectExtensions.OwnKeys(routerState.routeParams).Any())
            this.navHistoryItems = [];
    }

    override OnUnmounted()
    {
        this.subscription?.Unsubscribe();
    }

    //State
    private component: SingleRenderValue;
    private navHistoryItems: NavHistoryItem[];
    private subscription?: Subscription;
}