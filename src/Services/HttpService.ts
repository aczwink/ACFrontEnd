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
import { Injectable } from "../ComponentManager";
import { PrimitiveDictionary } from "../Model/Dictionary";

interface RequestHeaders
{
    Authorization?: string;
    "Content-Type"?: "application/json";
}

export interface HttpRequest
{
    data: any;
    headers: RequestHeaders;
    method: "GET" | "POST";
    responseType: "blob" | "json";
    url: string;
}

@Injectable
export class HttpService
{
    //Public methods
    public Get<T>(url: string, queryParams?: PrimitiveDictionary): Promise<T>
    {
        if(queryParams !== undefined)
        {
            const parts = [];
            for (const key in queryParams)
            {
                const value = queryParams[key];
                if(value === undefined)
                    throw new Error("Query param '" + key + "' can't be undefined");

                parts.push(key + "=" + encodeURIComponent(value));
            }
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

    public Post<T>(url: string, data: any): Promise<T>
    {
        const headers: RequestHeaders = {};
        if(data !== undefined)
        {
            data = JSON.stringify(data);
            headers["Content-Type"] = "application/json";
        }

        return this.Request({
            data: data,
            headers: headers,
            method: "POST",
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