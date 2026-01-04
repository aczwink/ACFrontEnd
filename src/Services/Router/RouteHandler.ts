/**
 * ACFrontEnd
 * Copyright (C) 2019-2026 Amir Czwink (amir130@hotmail.de)
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
import { Dictionary, AbsURL } from "acts-util-core";

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
    public CreateRouterState(url: AbsURL): RouterState | null
    {
        const routeParams: Dictionary<string> = {};
        const node = this.CreateRouterStateNode(url, url.pathSegments, routeParams);
        if(node !== null)
            return new RouterState(node, routeParams, url.queryParams, url.fragment);
        return null;
    }

    //Private members
    private path: AbsURL;
    private children: RouteHandler[];

    //Private methods
    private CreateRouterStateNode(url: AbsURL, pathSegments: string[], routeParams: Dictionary<string>): RouterStateNode | null
    {
        if(!this.Matches(pathSegments, routeParams))
            return null;

        if(!(this.route.path === ""))
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

            return node;
        }
        else if( (pathSegments.length === 0) || ((pathSegments.length === 1) && (pathSegments[0] === "")) )
            return node;

        return null;
    }

    private FindChildRoute(url: AbsURL, pathSegments: string[], routeParams: Dictionary<string>)
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
        if((this.route.path == "*") || (this.route.path === ""))
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

    private ResolveRedirect(url: AbsURL, pathSegments: string[], routeParams: Dictionary<string>): RouterStateNode | null
    {
        if(this.route.redirect!.startsWith("/"))
            throw new Error("NOT IMPLEMENTED");
        if(this.route.redirect!.startsWith("."))
            throw new Error("NOT IMPLEMENTED");

        if(this.parent === null)
            throw new Error("NOT IMPLEMENTED");

        return this.parent.FindChildRoute(url, this.route.redirect!.split("/").concat(pathSegments), routeParams);
    }

    private SegmentsMatch(routeSegment: string, pathSegment: string, routeParams: Dictionary<string>)
    {
        if((pathSegment.length > 0) && RouterStateNode.IsWildCardSegment(routeSegment))
        {
            const key = RouterStateNode.ExtractWildCardSegmentName(routeSegment);
            routeParams[key] = decodeURIComponent(pathSegment);
            return true;
        }
        return routeSegment == pathSegment;
    }
}
