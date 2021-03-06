/**
 * ACFrontEnd
 * Copyright (C) 2019-2021 Amir Czwink (amir130@hotmail.de)
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

interface UrlProperties
{
    readonly protocol: "http" | "https";
    readonly authority: string;
    readonly path: string;
    readonly queryParams: Dictionary<string>
}

/**
 * Represents a fully qualified url.
 */
export class Url implements UrlProperties
{
    constructor(properties: UrlProperties)
    {
        this.urlProperties = properties;
        this._pathSegments = this.SplitPathIntoSegments(this.urlProperties.path);
    }
    
    //Properties
    public get authority()
    {
        return this.urlProperties.authority;
    }

    public get path()
    {
        return this.urlProperties.path;
    }

    public get pathSegments()
    {
        return this._pathSegments;
    }

    public get protocol()
    {
        return this.urlProperties.protocol;
    }

    public get queryParams()
    {
        return this.urlProperties.queryParams;
    }

    //Public methods
    public Equals(other: Url)
    {
        return this.ToString() === other.ToString();
    }

    public PathAndQueryToString()
    {
        const queryParams = [];
        for (const key in this.queryParams)
        {
            if (this.queryParams.hasOwnProperty(key))
                queryParams.push(key + "=" + this.queryParams[key]);
        }
        const query = queryParams.length > 0 ? "?" + queryParams.join("&") : "";

        return this.path + query;
    }
    
    public ToString()
    {
        return this.protocol + "://" + this.authority + this.PathAndQueryToString();
    }

    //Public functions
    public static Relative(absolute: Url, relativePathWithQuery: string)
    {
        const parts = relativePathWithQuery.split("?");
        const relativePath = parts[0];
        const joinedPath = Url.JoinPaths(absolute.path, relativePath);

        return new Url({
            authority: absolute.authority,
            path: joinedPath,
            protocol: absolute.protocol,
            queryParams: Url.ParseQueryParams(parts[1] ?? "")
        });
    }

    public static Parse(urlString: string)
    {
        const parser = document.createElement("a");
        parser.href = urlString;

        return new Url({
            protocol: parser.protocol.slice(0, -1) as any,
            authority: parser.host,
            path: decodeURI(parser.pathname),
            queryParams: Url.ParseQueryParams(parser.search.substr(1))
        });
    }

    //Private members
    private urlProperties: UrlProperties;
    private _pathSegments: string[];

    //Private methods
    private SplitPathIntoSegments(path: string)
    {
        if(path.startsWith("/"))
            path = path.slice(1);

        if(path.endsWith("/"))
            path = path.slice(0, -1);
            
        return path.split("/");
    }

    //Private functions
    private static JoinPaths(first: string, second: string)
    {
        if(first.endsWith("/"))
            first = first.slice(0, -1);
        if(second.startsWith("/"))
            second = second.slice(1);

        return first + "/" + second;
    }

    private static ParseQueryParams(queryParamsString: string): Dictionary<string>
    {
        const queryParamsParts = queryParamsString.length > 0 ? queryParamsString.split("&") : [];
        const queryParams: Dictionary<string> = {};
        queryParamsParts.forEach(kv => {
            const split = kv.split("=")
            queryParams[split[0]] = split[1];
        });
        return queryParams;
    }
}