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
import { Injectable } from "../Injector";

export interface HttpRequest
{
    method: "GET" | "POST";
    url: string;
    data: any;
    responseType: "json";
}

@Injectable
export class HttpService
{
    //Public methods
    public Get<T>(url: string): Promise<T>
    {
        return this.Request({
            method: "GET",
            url: url,
            data: undefined,
            responseType: "json"
        });
    }

    public Post<T>(url: string, data: any): Promise<T>
    {
        return this.Request({
            method: "POST",
            url: url,
            data: data,
            responseType: "json"
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

        let data = undefined;
        if(request.data !== undefined)
        {
            data = JSON.stringify(request.data);
            httpRequest.setRequestHeader("Content-Type", "application/json");
        }

        httpRequest.send(data);
    }
}