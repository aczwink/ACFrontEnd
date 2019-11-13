/**
 * ACFrontEnd
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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
import { Url } from "../../Model/Url";
import { Route } from "./Route";
import { RouterState, RouterStateNode } from "./RouterState";

export class RouteHandler
{
    constructor(private route: Route, private parent: RouteHandler | null)
    {
        this.path = new Url(route.path);
        if(route.children === undefined)
            this.children = [];
        else
            this.children = route.children.map(childRoute => new RouteHandler(childRoute, this));
    }

    //Public methods
    public CreateRouterState(url: Url): RouterState | null
    {
        if(this.route.path == "*")
        {
            return new RouterState(
                {
                    route: this.route
                }
            );
        }

        const node = this.CreateRouterStateNode(url.pathSegments);
        if(node !== null)
            return new RouterState(node);
        return null;
    }

    //Private methods
    private CreateRouterStateNode(pathSegments: string[]): RouterStateNode | null
    {
        if(this.path.pathSegments.length > pathSegments.length)
            return null;

        for(let i = 0; i < this.path.pathSegments.length; i++)
        {
            if(this.path.pathSegments[i] !== pathSegments[i])
                return null;
        }
        pathSegments = pathSegments.slice(this.path.pathSegments.length); // remove the portion that has been matched

        if(this.route.redirect !== undefined)
        {
            return this.ResolveRedirect(pathSegments);
        }

        const node: RouterStateNode = {
            route: this.route
        };

        if(this.HasChildren())
        {
            let child: RouterStateNode | null;
            if(pathSegments.length > 0)
                child = this.FindChildRoute(pathSegments);
            else //children need to have default route
                child = this.FindChildRoute([""]);
            
            if(child === null)
                return null;
            node.child = child;
        }

        return node;
    }

    private FindChildRoute(pathSegments: string[])
    {
        for(let i = 0; i < this.children!.length; i++)
        {
            const node = this.children![i].CreateRouterStateNode(pathSegments);
            if(node !== null)
                return node;
        }
        return null;
    }

    private HasChildren()
    {
        return this.children.length > 0;
    }

    private ResolveRedirect(pathSegments: string[]): RouterStateNode | null
    {
        if(this.route.redirect!.startsWith("/"))
            throw new Error("NOT IMPLEMENTED");
        if(this.route.redirect!.startsWith("."))
            throw new Error("NOT IMPLEMENTED");

        if(this.parent === null)
            throw new Error("NOT IMPLEMENTED");

        return this.parent.FindChildRoute([this.route.redirect!].concat(pathSegments));
    }

    //Private members
    private path: Url;
    private children: RouteHandler[];
}
