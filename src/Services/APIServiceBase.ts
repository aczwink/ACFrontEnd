/**
 * ACFrontEnd
 * Copyright (C) 2022 Amir Czwink (amir130@hotmail.de)
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
import { Dictionary, URL } from "acts-util-core";
import { HTTPMethod, HTTPService, RequestHeaders } from "./HTTPService";

interface RequestData
{
    path: string;
    method: HTTPMethod;
    query?: object;
    body?: object;
    requestBodyType?: "form-data";
    responseType: "blob" | "json";
}

export class APIServiceBase
{
    constructor(private httpService: HTTPService, private backendAuthority: string, private backendProtocol: "http" | "https")
    {
    }

    //Public methods
    public async IssueRequest(requestData: RequestData)
    {
        const url = new URL({
            authority: this.backendAuthority,
            path: requestData.path,
            protocol: this.backendProtocol,
            queryParams: (requestData.query === undefined) ? {} : (requestData.query as Dictionary<string>)
        });
        const response = await this.httpService.SendRequest({
            body: this.FormatBody(requestData.body, requestData.requestBodyType),
            headers: this.CreateHeaders(requestData.body, requestData.requestBodyType),
            method: requestData.method,
            responseType: requestData.responseType,
            url: url.ToString()
        });
        
        return {
            statusCode: response.statusCode,
            data: response.body
        };
    }

    //Private methods
    private CreateHeaders(body: object | undefined, requestBodyType: "form-data" | undefined): RequestHeaders
    {
        if((body !== undefined) && (requestBodyType !== "form-data"))
        {
            return {
                "Content-Type": "application/json"
            };
        }
        return {};
    }

    private FormatBody(body: object | undefined, requestBodyType: "form-data" | undefined): any
    {
        if(body === undefined)
            return undefined;

        if(requestBodyType === "form-data")
        {
            //let XmlHttpRequest do this since it also sets the boundary
            //headers["Content-Type"] = "multipart/form-data";
            const fd = new FormData();

            for (const key in body)
            {
                if (Object.prototype.hasOwnProperty.call(body, key))
                {
                    fd.append(key, (body as any)[key]);
                }
            }

            return fd;
        }

        return JSON.stringify(body);
    }
}