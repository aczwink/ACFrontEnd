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

export function EqualsAny(v1: any, v2: any)
{
    if(typeof v1 === typeof v2)
    {
        if(Array.isArray(v1))
            return EqualsArray(v1, v2);

        //typeof null is "object" -.-
        if(v1 === null)
            return v2 === null;
        if(v2 === null)
            return false;

        if(typeof v1 === "object")
            return EqualsObject(v1, v2);

        return v1 === v2;
    }

    return false;
}

function EqualsArray(v1: Array<any>, v2: Array<any>)
{
    if(v1.length != v2.length)
        return false;
    for(var i = 0; i < v1.length; i++)
    {
        if(!EqualsAny(v1[i], v2[i]))
            return false;
    }
    return true;
}

function EqualsObject(v1: object, v2: object)
{
    if(Object.is(v1, v2))
        return true;

    const keys1 = Object.keys(v1);
    const keys2 = Object.keys(v2);

    if(keys1.length != keys2.length)
        return false;

    for (let index = 0; index < keys1.length; index++)
    {
        const key = keys1[index];
        if(!EqualsAny((v1 as any)[key], (v2 as any)[key]))    
            return false;
    }
    return true;
}