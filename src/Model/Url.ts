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

interface UrlParts
{
    fullUrl: string;
    path: string;
}

export class Url
{
    constructor(urlString: string);
    constructor(path: string, queryParams: Dictionary<string>);
    constructor(pathSegments: string[]);
    constructor(input?: any, queryParams?: Dictionary<string>)
    {
        if(typeof(input) === "string")
        {
            const path = this.ParseUrl(input).path;
            this.path = this.ToAbsolutePath(path).path;
            this._pathSegments = this.SplitPathIntoSegments(this.path);
        }
        else
        {
            this._pathSegments = input;
            this.path = this._pathSegments.join("/");
        }

        if(queryParams === undefined)
            this._queryParams = {};
        else
            this._queryParams = queryParams;
    }
    
    //Properties
    get pathSegments()
    {
        return this._pathSegments;
    }

    public get queryParams()
    {
        return this._queryParams;
    }

    //Public methods
    public ToString()
    {
        return this.ToAbsolutePath(this.path).fullUrl;
    }

    //Private members
    private path: string;
    private _pathSegments: string[];
    private _queryParams: Dictionary<string>;

    //Private methods
    private JoinPaths(first: string, second: string)
    {
        if(first.endsWith("/"))
            first = first.slice(0, -1);
        if(second.startsWith("/"))
            second = second.slice(1);

        return first + "/" + second;
    }

    private ParseUrl(url: string): UrlParts
    {
        const parser = document.createElement("a");
        parser.href = url;

        return {
            fullUrl: parser.href,
            path: decodeURI(parser.pathname)
        };
    }

    private SplitPathIntoSegments(path: string)
    {
        if(path.startsWith("/"))
            path = path.slice(1);

        if(path.endsWith("/"))
            path = path.slice(0, -1);
            
        return path.split("/");
    }

    private ToAbsolutePath(path: string): UrlParts
    {
        const root = document.head.getElementsByTagName("base")[0].href;

        return this.ParseUrl(this.JoinPaths(root, path));
    }
}