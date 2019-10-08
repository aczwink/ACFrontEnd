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

import { Route } from "./Route";
import { Url } from "../../Model/Url";

export interface RouterStateNode
{
    route: Route;
    child?: RouterStateNode;
}

export class RouterState
{
    constructor(root: RouterStateNode | null)
    {
        this._root = root;
    }

    //Properties
    get root(): RouterStateNode | null
    {
        return this._root;
    }

    //Public methods
    public ToUrl(): Url
    {
        const segments = [];
        let node: RouterStateNode | null | undefined = this._root;
        while((node !== null) && (node !== undefined))
        {
            segments.push(node.route.path);
            node = node.child;
        }
        return new Url(segments);
    }

    //Private members
    private _root: RouterStateNode | null;
}