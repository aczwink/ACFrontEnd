/**
 * ACFrontEnd
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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
import { Duration } from "acts-util-core";

@Injectable
export class CookieService
{
    //Public methods
    public Get(name: string)
    {
        const cookies = document.cookie.split(";");
        for(var i = 0; i < cookies.length; i++)
        {
            const cookie = cookies[i];
            const [key, value] = cookie.split("=");
            if(name === key.trim())
                return value;
        }
        return undefined;
    }

    public Set(name: string, value: string, expiryDuration?: Duration)
    {
        const parts = [
            name + "=" + value,
            "path=/",
        ];

        if(expiryDuration)
        {
            const d = new Date(Date.now() + expiryDuration.milliseconds);
            parts.push("expires=" + d.toUTCString());
        }

        document.cookie = parts.join(";");
    }
}