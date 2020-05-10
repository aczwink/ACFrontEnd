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
import { Property } from "acts-util-core";

import { Injectable, Injector } from "../../Injector";
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
        Injector.Register(Router, this);

        const state = this.CreateRouterState(new Url(window.location.href));
        this._state = new Property<RouterState>(state);
        state.Activate();
    }

    //Properties
    get state()
    {
        return this._state;
    }

    //Public methods
    public RouteTo(url: string | Url)
    {
        if(typeof(url) === "string")
            url = new Url(url);

        const newState = this.CreateRouterState(url);
        newState.Activate();
        this._state.Set(newState);
        this.AddStateToHistory(newState);
    }

    //Private methods
    private AddStateToHistory(routerState: RouterState)
    {
        const url = routerState.ToUrl().ToString();
        const state = {
			type: "url",
			url: url
		};
		window.history.pushState(state, "", url);
    }

    private CreateRouterState(url: Url): RouterState
    {
        for (let i = 0; i < this.routes.length; i++)
        {
            const route = this.routes[i];
            const result = route.CreateRouterState(url);
            if(result !== null)
                return result;
        }
        throw Error("Can not find a route for url: " + url);
    }

    private TransformRoutes(routes: Routes)
    {
        this.routes = routes.map(route => new RouteHandler(route, null));
    }

    //Private members
    private _state: Property<RouterState>;
    private routes!: RouteHandler[];
}