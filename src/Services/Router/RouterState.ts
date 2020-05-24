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

import { Route } from "./Route";
import { Url } from "../../Model/Url";
import { RootInjector } from "../../App";

export class RouterStateNode
{
    route: Route;
    child?: RouterStateNode;

    constructor(route: Route, child?: RouterStateNode)
    {
        this.route = route;
        this.child = child;
    }
}

export class RouterState
{
    constructor(root: RouterStateNode, routeParams: Dictionary<string>, queryParams?: Dictionary<string>)
    {
        this._root = root;
        this._routeParams = routeParams;
        if(queryParams === undefined)
            this._queryParams = {};
        else
            this._queryParams = queryParams;
    }

    //Properties
    get root(): RouterStateNode
    {
        return this._root;
    }

    public get queryParams()
    {
        return this._queryParams;
    }

    public get routeParams(): Dictionary<string>
    {
        return this._routeParams;
    }

    //Public methods
    public Activate()
    {
        this.ActivateNode(this._root);
    }

    public ToUrl(): Url
    {
        if(this._root.route.path == "*")
            return new Url("/");

        const finalSegments = [];
        let node: RouterStateNode | null | undefined = this._root;
        while((node !== null) && (node !== undefined))
        {
            const segments = node.route.path.split("/");
            for (let segment of segments)
            {
                if(segment.startsWith(":"))
                {
                    const key = segment.substring(1);
                    segment = this._routeParams[key]!;
                }

                finalSegments.push(segment);
            }

            node = node.child;
        }
        return new Url(finalSegments, this._queryParams);
    }

    //Private members
    private _root: RouterStateNode;
    private _routeParams: Dictionary<string>;
    private _queryParams: Dictionary<string>;

    //Private methods
    private ActivateNode(node: RouterStateNode)
    {
        if(node.route.guards !== undefined)
        {
            for (const guard of node.route.guards)
            {
                const instance = RootInjector.Resolve(guard);
                if(!instance.CanActivate())
                {
                    instance.OnActivationFailure(this);
                    return;
                }
            }
        }
        
        if(node.child !== undefined)
            this.ActivateNode(node.child);
    }
}