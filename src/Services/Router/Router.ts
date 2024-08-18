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
import { Property, AbsURL } from "acts-util-core";

import { Routes } from "./Route";
import { RouteHandler } from "./RouteHandler";
import { RouterState, RouterStateNode } from "./RouterState";
import { RootInjector } from "../../App";
import { Injectable } from "../../decorators";


@Injectable
export class Router
{
    constructor(routes: Routes)
    {
        this.mainRouteHandler = new RouteHandler({ path: "", children: routes }, null);
        routes.forEach(route => new RouteHandler(route, this.mainRouteHandler));
        
        RootInjector.RegisterInstance(Router, this);

        const state = this.CreateRouterState(RouterState.ParseURL(window.location.href));
        this._state = new Property<RouterState>(state);
        this.UpdateRouterState(state);

        window.onpopstate = this.OnPopHistoryState.bind(this);
    }

    //Properties
    public get state()
    {
        return this._state;
    }

    //Public methods
    public RouteTo(url: string | AbsURL)
    {
        if(typeof(url) === "string")
            url = RouterState.CreateAbsoluteUrl(url);

        const newState = this.CreateRouterState(url);
        this.UpdateRouterState(newState);
    }

    //Private methods
    private AddURLToHistory(url: string)
    {
        const state = {
			type: "url",
			url: url
		};
        window.history.pushState(state, "", url);
    }

    private CreateRouterState(url: AbsURL): RouterState
    {
        const result = this.mainRouteHandler.CreateRouterState(url);
        if(result !== null)
            return result;
        throw Error("Can not find a route for url: " + url.ToString());
    }

    //Private members
    private _state: Property<RouterState>;
    private mainRouteHandler: RouteHandler;

    //Private methods
    private UpdateRouterState(state: RouterState)
    {
        if(this.SetRouterState(state))
        {
            this.AddURLToHistory(state.ToUrl().ToString());
            return true;
        }
        return false;
    }

    private SetRouterState(state: RouterState)
    {
        if(state.Activate())
        {
            RootInjector.RegisterInstance(RouterState, state);
            RootInjector.RegisterInstance(RouterStateNode, state.root);

            if(this._state.Get() !== state)
                this._state.Set(state);

            return true;
        }
        return false;
    }

    //Event handlers
    private OnPopHistoryState(event: PopStateEvent)
    {
        if(event.state === null)
            return;

        switch(event.state.type)
        {
            case "url":
                const url = RouterState.ParseURL(event.state.url);
                const newState = this.CreateRouterState(url);
                this.SetRouterState(newState);
            break;
        }
    }
}