/**
 * ACFrontEnd
 * Copyright (C) 2025 Amir Czwink (amir130@hotmail.de)
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
import { OIDC_Config } from "acts-util-core";
import { Injectable } from "../decorators";
import { HTTPService } from "./HTTPService";

@Injectable
export class OIDCService
{
    constructor(private httpService: HTTPService)
    {
    }

    //Public methods
    public async RequestConfig(domainNameWithPort: string)
    {
        const response = await this.httpService.SendRequest({
            headers: {},
            method: "GET",
            responseType: "json",
            url: "https://" + domainNameWithPort + "/.well-known/openid-configuration",
            progressTracker: () => null,
        });

        return response.body as OIDC_Config;
    }
}