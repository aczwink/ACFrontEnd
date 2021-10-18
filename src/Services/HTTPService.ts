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
import { Injectable } from "../ComponentManager";
import { PrimitiveDictionary } from "../Model/Dictionary";
import { Url } from "../Model/Url";
import { RouterState } from "./Router/RouterState";

interface RequestHeaders
{
    Authorization?: string;
    "Content-Type"?: "application/json" | "multipart/form-data";
}

type HttpDataMethod = "DELETE" | "POST" | "PUT";;
export type HTTPMethod = "GET" | HttpDataMethod;

export interface HttpRequest
{
    data: any;
    headers: RequestHeaders;
    method: HTTPMethod;
    responseType: "blob" | "json";
    url: string;
}

@Injectable
export class HTTPService
{
    //Public methods
    public DataRequest<T>(url: string, httpMethod: HttpDataMethod, data: any | FormData): Promise<T>
    {
        const headers: RequestHeaders = {};
        if(data !== undefined)
        {
            if(data instanceof FormData)
            {
                //let XmlHttpRequest do this since it also sets the boundary
                //headers["Content-Type"] = "multipart/form-data";
            }
            else
            {
                data = JSON.stringify(data);
                headers["Content-Type"] = "application/json";
            }
        }

        return this.Request({
            data: data,
            headers: headers,
            method: httpMethod,
            responseType: "json",
            url: url
        });
    }

    public Get<T>(url: string, queryParams?: PrimitiveDictionary): Promise<T>
    {
        if(queryParams !== undefined)
        {
            const parts = [];
            for (const key in queryParams)
            {
                if (!Object.prototype.hasOwnProperty.call(queryParams, key))
                    continue;

                const value = queryParams[key];
                if(value === undefined)
                    continue;

                parts.push(key + "=" + encodeURIComponent(value));
            }
            if(parts.length > 0)
                url += "?" + parts.join("&");
        }

        return this.Request({
            data: undefined,
            headers: {},
            method: "GET",
            responseType: "json",
            url: url
        });
    }

    public Request(request: HttpRequest): Promise<any>
    {
        return new Promise<any>( (resolve, reject) => {
            return this.IssueRequest(request, resolve, reject);
        });
    }

    public SimpleRequest<T>(authority: string, route: string, method: HTTPMethod, data: any, routeParams?: any)
    {
        if(routeParams !== undefined)
        {
            const segments = RouterState.CreateAbsoluteUrl(route).pathSegments;
            route = "/" + segments.map(x => x.startsWith(":") ? routeParams[x.substr(1)] : x).join("/");
        }
        const url = new Url({
            authority: authority,
            path: route,
            protocol: "http",
            queryParams: {}
        });

        if(method === "GET")
            return this.Get<T>(url.ToString(), data);
        return this.DataRequest<T>(url.ToString(), method, data);
    }

    //Private methods
    private IssueRequest(request: HttpRequest, resolve: Function, reject: Function)
    {
        const httpRequest = new XMLHttpRequest;

        httpRequest.responseType = request.responseType;

        httpRequest.open(request.method, request.url, true);
        httpRequest.onreadystatechange = function()
        {
            if(this.readyState == 4)
            {
                switch(this.status)
                {
                    case 200: //OK
                        resolve(this.response);
                    break;
                    default:
                        reject(this.status);
                }
            }
        }
        
        for (const key in request.headers)
        {
            if (request.headers.hasOwnProperty(key))
            {
                const value = (request.headers as any)[key];
                httpRequest.setRequestHeader(key, value);
            }
        }

        httpRequest.send(request.data);
    }
}