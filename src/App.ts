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
import { Component } from "./Component";
import { Injector, Instantiatable } from "./Injector";
import { Router } from "./Services/Router/Router";
import { Routes } from "./Services/Router/Route";

export interface AppProperties
{
    mountPoint: HTMLElement;
    rootComponentClass: Instantiatable<Component>;
    routes: Routes;
}

export class App
{
    constructor(private properties: AppProperties)
    {
        this.router = new Router(properties.routes);
        Injector.Register(Router, this.router);

        window.addEventListener("load", this.OnWindowLoaded.bind(this), false);
    }

    //Event handlers
    private OnWindowLoaded()
    {
        const rootComponent = Injector.CreateComponent(this.properties.rootComponentClass);
        if(rootComponent.domNode !== null)
            this.properties.mountPoint.appendChild(rootComponent.domNode);
    }

    //Private members
    private router: Router;
}