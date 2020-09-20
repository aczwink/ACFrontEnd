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
    protocol: string;
    host: string;
    path: string;
    queryParams: Dictionary<string>;
}

export class Url
{
    constructor(urlString: string);
    constructor(path: string, queryParams: Dictionary<string>);
    constructor(pathSegments: string[], queryParams: Dictionary<string>);
    constructor(input: string|string[], queryParams?: Dictionary<string>)
    {
        if(Array.isArray(input))
        {
            this.protocol = window.location.protocol;
            this.host = window.location.host;

            this._pathSegments = input;
            this.path = this._pathSegments.join("/");

            this._queryParams = {};
        }
        else
        {
            //full url or path
            const urlParseResult = this.ParseUrl(input);

            this.protocol = urlParseResult.protocol;
            this.host = urlParseResult.host;

            this.path = this.ToAbsolutePath(urlParseResult.path).path;
            this._pathSegments = this.SplitPathIntoSegments(this.path);

            this._queryParams = urlParseResult.queryParams;
        }

        if(queryParams !== undefined)
            Object.assign(this._queryParams, queryParams);
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
        const queryParams = [];
        for (const key in this._queryParams)
        {
            if (this._queryParams.hasOwnProperty(key))
                queryParams.push(key + "=" + this._queryParams[key]);
        }
        const url = this.protocol + "//" + this.host + "/" + this.path + (queryParams.length > 0 ? "?" + queryParams.join("&") : "");
        return url;
    }

    //Private members
    private protocol: string;
    private host: string;
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

        const queryParamsParts = parser.search.length > 0 ? parser.search.substr(1).split("&") : [];
        const queryParams: Dictionary<string> = {};
        queryParamsParts.forEach(kv => {
            const split = kv.split("=")
            queryParams[split[0]] = split[1];
        });

        return {
            fullUrl: parser.href,
            protocol: parser.protocol,
            host: parser.host,
            path: decodeURI(parser.pathname),
            queryParams: queryParams
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