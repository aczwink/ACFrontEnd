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

import { APIResponse, InfoMessageManager, Injectable } from "acfrontend";

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

@Injectable
export class APIResponseHandler
{
    constructor(private infoMessageManager: InfoMessageManager)
    {
    }

    //Public methods
    public async ExtractDataFromResponseOrShowErrorMessageOnError<ObjectType>(response: APIResponse<ObjectType>): Promise<Result<ObjectType>>
    {
        const result = await this.ExtractDataOrErrorFromResponse(response);

        if(!result.ok)
        {
            this.infoMessageManager.ShowMessage(result.error, {
                type: "danger",
                duration: 10000
            });
        }

        return result;
    }
    
    public async ShowErrorMessageOnErrorFromResponse(response: APIResponse<any>)
    {
        await this.ExtractDataFromResponseOrShowErrorMessageOnError(response);
    }

    //Private methods
    private async ExtractDataOrErrorFromResponse<ObjectType>(response: APIResponse<ObjectType>): Promise<Result<ObjectType>>
    {
        switch(response.statusCode)
        {
            case 200:
                return { ok: true, value: (response as any).data };
            case 204:
                return { ok: true, value: undefined as any };
            case 400:
            case 403:
            case 404:
            case 409:
            case 500:
                return { ok: false, error: await this.ExtractErrorMessageFromRawBody(response.rawBody) };
            default:
                alert("unhandled status code: " + response.statusCode);
                throw new Error("unhandled status code: " + response.statusCode);
        }
    }

    private async ExtractErrorMessageFromRawBody(rawBody: any)
    {
        if(rawBody instanceof Blob)
            return await rawBody.text();
        return rawBody;
    }
}