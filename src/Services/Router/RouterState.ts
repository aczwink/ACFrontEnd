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
import { Dictionary, AbsURL, URLParser } from "acts-util-core";

import { Route } from "./Route";
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
        return this.ActivateNode(this._root);
    }

    public ToUrl(): AbsURL
    {
        if(this._root.route.path == "*")
            return RouterState.CreateAbsoluteUrl("/");

        const finalSegments = [];
        let node: RouterStateNode | null | undefined = this._root;
        while((node !== null) && (node !== undefined))
        {
            if(node.route.path.length > 0)
            {
                const replaced = RouterState.ReplaceRouteParams(node.route.path, this._routeParams);
                finalSegments.push(...replaced);
            }

            node = node.child;
        }
        return RouterState.CreateAbsoluteUrlFromSegments(finalSegments, this._queryParams);
    }

    //Functions
    public static CreateAbsoluteUrl(pathWithQuery: string)
    {
        const root = document.head.getElementsByTagName("base")[0].href;
        const urlRoot = this.ParseURL(root);

        return AbsURL.FromRelative(urlRoot, pathWithQuery);
    }

    public static ParseURL(urlString: string)
    {
        const parser = document.createElement("a");
        parser.href = urlString;

        const proto = parser.protocol.slice(0, -1);
        return new AbsURL({
            protocol: proto as any,
            host: parser.hostname,
            port: (parser.port.length === 0) ? this.GetDefaultPortFromProtocol(proto as any) : parseInt(parser.port),
            path: decodeURI(parser.pathname),
            queryParams: URLParser.ParseQueryParams(parser.search.substr(1))
        });
    }

    public static ReplaceRouteParams(path: string, routeParams: Dictionary<string>)
    {
        const replacedSegments = [];

        const segments = path.split("/");
        for (let segment of segments)
        {
            if(segment.startsWith(":"))
            {
                const key = segment.substring(1);
                segment = encodeURIComponent(routeParams[key]!);
            }

            replacedSegments.push(segment);
        }

        return replacedSegments;
    }

    //Private members
    private _root: RouterStateNode;
    private _routeParams: Dictionary<string>;
    private _queryParams: Dictionary<string>;

    //Private methods
    private ActivateNode(node: RouterStateNode): boolean
    {
        if(node.route.guards !== undefined)
        {
            for (const guard of node.route.guards)
            {
                const instance = RootInjector.Resolve(guard);
                if(!instance.CanActivate())
                {
                    instance.OnActivationFailure(this);
                    return false;
                }
            }
        }
        
        if(node.child !== undefined)
            return this.ActivateNode(node.child);
        return true;
    }

    //Private functions
    private static CreateAbsoluteUrlFromSegments(segments: string[], queryParams: Dictionary<string>)
    {
        const url = RouterState.CreateAbsoluteUrl(segments.join("/"));
        return new AbsURL({
            host: url.host,
            path: url.path,
            port: url.port,
            protocol: url.protocol,
            queryParams
        });
    }

    private static GetDefaultPortFromProtocol(protocol: "http" | "https")
    {
        switch(protocol)
        {
            case "http":
                return 80;
            case "https":
                return 443;
        }
    }
}