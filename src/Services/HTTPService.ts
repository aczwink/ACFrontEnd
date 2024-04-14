/**
 * ACFrontEnd
 * Copyright (C) 2019-2024 Amir Czwink (amir130@hotmail.de)
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
import { Injectable } from "../ComponentManager";

export type HTTPMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export interface RequestHeaders
{
    Authorization?: string;
    "Content-Type"?: "application/json";
}

interface RequestData
{
    body?: string | FormData;
    headers: RequestHeaders;
    method: HTTPMethod;
    progressTracker: ((event: ProgressEvent) => void) | null;
    responseType: "blob" | "json";
    url: string;
}

export interface ResponseData
{
    statusCode: number;
    headers: Dictionary<string>;
    body: any;
}

@Injectable
export class HTTPService
{
    //Public methods
    public SendRequest(request: RequestData)
    {
        return new Promise<ResponseData>( (resolve, reject) => {
            return this.IssueRequest(request, resolve, reject);
        });
    }

    //Private methods
    private IssueRequest(request: RequestData, resolve: (result: ResponseData) => void, reject: Function)
    {
        const httpRequest = new XMLHttpRequest;

        httpRequest.responseType = request.responseType;

        httpRequest.open(request.method, request.url, true);
        const context = this;
        httpRequest.onprogress = request.progressTracker;
        httpRequest.onreadystatechange = function()
        {
            if(this.readyState == 4)
            {
                resolve({
                    statusCode: this.status,
                    headers: context.ParseHeaders(httpRequest.getAllResponseHeaders()),
                    body: this.response
                });
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

        httpRequest.send(request.body);
    }

    private ParseHeaders(headers: string)
    {
        var arr = headers.trim().split(/[\r\n]+/);
        
        var headerMap: Dictionary<string> = {};
        arr.forEach(function (line)
        {
            var parts = line.split(': ');
            var header = parts.shift()!;
            var value = parts.join(': ');
            headerMap[header] = value;
        });

        return headerMap;
    }
}