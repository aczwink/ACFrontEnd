/**
 * ACFrontEnd
 * Copyright (C) 2019-2022 Amir Czwink (amir130@hotmail.de)
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

export type HTTPMethod = "DELETE" | "GET" | "POST" | "PUT";

export interface RequestHeaders
{
    "Content-Type"?: "application/json";
}

interface RequestData
{
    body: any;
    headers: RequestHeaders;
    method: HTTPMethod;
    responseType: "blob" | "json";
    url: string;
}

interface ResponseData
{
    statusCode: number;
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
        httpRequest.onreadystatechange = function()
        {
            if(this.readyState == 4)
            {
                resolve({
                    statusCode: this.status,
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
}