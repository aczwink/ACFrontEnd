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
import { Dictionary } from "acts-util-core";

import { Url } from "../../Model/Url";
import { Route } from "./Route";
import { RouterState, RouterStateNode } from "./RouterState";

export class RouteHandler
{
    constructor(private route: Route, private parent: RouteHandler | null)
    {
        this.path = RouterState.CreateAbsoluteUrl(route.path);

        if(route.children === undefined)
            this.children = [];
        else
            this.children = route.children.map(childRoute => new RouteHandler(childRoute, this));
    }

    //Public methods
    public CreateRouterState(url: Url): RouterState | null
    {
        const routeParams: Dictionary<string> = {};
        const node = this.CreateRouterStateNode(url, url.pathSegments, routeParams);
        if(node !== null)
            return new RouterState(node, routeParams, url.queryParams);
        return null;
    }

    //Private members
    private path: Url;
    private children: RouteHandler[];

    //Private methods
    private CreateRouterStateNode(url: Url, pathSegments: string[], routeParams: Dictionary<string>): RouterStateNode | null
    {
        if(!this.Matches(pathSegments, routeParams))
            return null;

        pathSegments = pathSegments.slice(this.path.pathSegments.length); // remove the portion that has been matched

        if(this.route.redirect !== undefined)
        {
            return this.ResolveRedirect(url, pathSegments, routeParams);
        }

        const node: RouterStateNode = {
            route: this.route
        };

        if(this.HasChildren())
        {
            let child: RouterStateNode | null;
            if(pathSegments.length > 0)
                child = this.FindChildRoute(url, pathSegments, routeParams);
            else //children need to have default route
                child = this.FindChildRoute(url, [""], routeParams);
            
            if(child === null)
                return null;
            node.child = child;
        }

        return node;
    }

    private FindChildRoute(url: Url, pathSegments: string[], routeParams: Dictionary<string>)
    {
        for(let i = 0; i < this.children!.length; i++)
        {
            const node = this.children![i].CreateRouterStateNode(url, pathSegments, routeParams);
            if(node !== null)
                return node;
        }
        return null;
    }

    private HasChildren()
    {
        return this.children.length > 0;
    }

    private Matches(pathSegments: string[], routeParams: Dictionary<string>)
    {
        if(this.route.path == "*")
            return true;

        if(this.path.pathSegments.length > pathSegments.length)
            return false;

        for(let i = 0; i < this.path.pathSegments.length; i++)
        {
            if(!this.SegmentsMatch(this.path.pathSegments[i], pathSegments[i], routeParams))
                return false;
        }

        return true;
    }

    private ResolveRedirect(url: Url, pathSegments: string[], routeParams: Dictionary<string>): RouterStateNode | null
    {
        if(this.route.redirect!.startsWith("/"))
            throw new Error("NOT IMPLEMENTED");
        if(this.route.redirect!.startsWith("."))
            throw new Error("NOT IMPLEMENTED");

        if(this.parent === null)
            throw new Error("NOT IMPLEMENTED");

        return this.parent.FindChildRoute(url, [this.route.redirect!].concat(pathSegments), routeParams);
    }

    private SegmentsMatch(routeSegment: string, pathSegment: string, routeParams: Dictionary<string>)
    {
        if(routeSegment.startsWith(":") && (pathSegment.length > 0) )
        {
            const key = routeSegment.substring(1);
            routeParams[key] = pathSegment;
            return true;
        }
        return routeSegment == pathSegment;
    }
}
