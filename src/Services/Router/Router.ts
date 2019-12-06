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
import { Injectable } from "../../Injector";
import { Observable } from "../../Observable";
import { Routes } from "./Route";
import { RouteHandler } from "./RouteHandler";
import { RouterState, RouterStateNode } from "./RouterState";
import { Url } from "../../Model/Url";


@Injectable
export class Router
{
    constructor(routes: Routes)
    {
        this.TransformRoutes(routes);
        this._state = new Observable<RouterState>(new RouterState(null, {}));
        this.UpdateState(window.location.href);
    }

    //Properties
    get state()
    {
        return this._state;
    }

    //Public methods
    public RouteTo(route: string)
    {
        this.UpdateState(route);
    }

    //Private methods
    private AddStateToHistory()
    {
        const url = this.state.Get().ToUrl().ToString();
        const state = {
			type: "url",
			url: url
		};
		window.history.pushState(state, "", url);
    }

    private CreateRouterState(url: Url): RouterState | null
    {
        for (let i = 0; i < this.routes.length; i++)
        {
            const route = this.routes[i];
            const result = route.CreateRouterState(url);
            if(result !== null)
                return result;
        }
        return null;
    }

    private TransformRoutes(routes: Routes)
    {
        this.routes = routes.map(route => new RouteHandler(route, null));
    }

    private UpdateState(urlString: string)
    {
        const url = new Url(urlString);
        const newState = this.CreateRouterState(url);
        if(newState === null)
            throw Error("Can not find a route for url: " + url);
        this._state.Set(newState);
        this.AddStateToHistory();
    }

    //Private members
    private _state: Observable<RouterState>;
    private routes!: RouteHandler[];
}