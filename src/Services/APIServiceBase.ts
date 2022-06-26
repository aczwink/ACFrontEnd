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
import { Dictionary, AbsURL } from "acts-util-core";
import { HTTPMethod, HTTPService, RequestHeaders, ResponseData } from "./HTTPService";

type Formats = "date-time";
interface FormatRule
{
    format: Formats;
    keys: string[];
}

interface RequestData
{
    path: string;
    method: HTTPMethod;
    query?: object;
    body?: object;
    requestBodyType?: "form-data";
    responseType: "blob" | "json";
    successStatusCode: number;
    formatRules: FormatRule[];
}

export interface HTTPInterceptor
{
    /**
     * Should return false if the response was intercepted. True if it should be processed normally.
     */
    Intercept(response: ResponseData): Promise<boolean>;
}

export class APIServiceBase
{
    constructor(private httpService: HTTPService, private backendHost: string, private backendPort: number, private backendProtocol: "http" | "https")
    {
        this._globalHeaders = {};
        this.interceptors = [];
    }

    //Properties
    public get globalHeaders()
    {
        return this._globalHeaders;
    }

    //Public methods
    public RegisterInterceptor(interceptor: HTTPInterceptor)
    {
        this.interceptors.push(interceptor);
    }

    public async SendRequest(requestData: RequestData)
    {
        const url = new AbsURL({
            host: this.backendHost,
            path: requestData.path,
            port: this.backendPort,
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

        await this.Intercept(response);
        
        return {
            statusCode: response.statusCode,
            data: (response.statusCode === requestData.successStatusCode) ? this.ApplyFormatRules(response.body, requestData.formatRules) : response.body
        };
    }

    //Private variables
    private _globalHeaders: RequestHeaders;
    private interceptors: HTTPInterceptor[];

    //Private methods
    private ApplyFormat(value: any, format: Formats)
    {
        switch(format)
        {
            case "date-time":
                return new Date(value);
        }
    }

    private ApplyFormatRules(body: any, formatRules: FormatRule[])
    {
        for (const rule of formatRules)
        {
            let object = body;
            for(let i = 0; i < rule.keys.length - 1; i++)
            {
                const key = rule.keys[i];
                object = object[key];
            }
            const lastKey = rule.keys[rule.keys.length - 1];
            object[lastKey] = this.ApplyFormat(object[lastKey], rule.format);
        }
        return body;
    }

    private CreateHeaders(body: object | undefined, requestBodyType: "form-data" | undefined): RequestHeaders
    {
        const headers = this._globalHeaders.Clone();

        if((body !== undefined) && (requestBodyType !== "form-data"))
            headers["Content-Type"] = "application/json";

        return headers;
    }

    private FormatBody(body: object | undefined, requestBodyType: "form-data" | undefined)
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

    private async Intercept(response: ResponseData)
    {
        for (const handler of this.interceptors)
        {
            const result = await handler.Intercept(response);
            if(!result)
                throw new Error("HTTP response was intercepted");
        }
    }
}