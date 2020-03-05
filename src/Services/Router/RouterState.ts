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

import { Route } from "./Route";
import { Url } from "../../Model/Url";
import { Dictionary } from "../../Model/Dictionary";

export interface RouterStateNode
{
    route: Route;
    child?: RouterStateNode;
}

export class RouterState
{
    constructor(root: RouterStateNode | null, routeParams: Dictionary<string>)
    {
        this._root = root;
        this._routeParams = routeParams;
    }

    //Properties
    get root(): RouterStateNode | null
    {
        return this._root;
    }

    public get routeParams(): Dictionary<string>
    {
        return this._routeParams;
    }

    //Public methods
    public ToUrl(): Url
    {
        const finalSegments = [];
        let node: RouterStateNode | null | undefined = this._root;
        while((node !== null) && (node !== undefined))
        {
            const segments = node.route.path.split("/");
            for (let segment of segments)
            {
                if(segment.startsWith(":"))
                {
                    const key = segment.substring(1);
                    segment = this._routeParams[key];
                }

                finalSegments.push(segment);
            }

            node = node.child;
        }
        return new Url(finalSegments);
    }

    //Private members
    private _root: RouterStateNode | null;
    private _routeParams: Dictionary<string>;
}