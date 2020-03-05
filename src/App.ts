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
import { Component } from "./Component";
import { Injector, Instantiatable } from "./Injector";
import { Router } from "./Services/Router/Router";
import { Routes } from "./Services/Router/Route";
import { PopupManager } from "./Services/PopupManager";
import { TitleService } from "./Services/TitleService";
import { VirtualNode } from "./VirtualNode";

export interface AppProperties
{
    mountPoint: HTMLElement;
    rootComponentClass: Instantiatable<Component>;
    routes: Routes;
    title: string;
    version: string;
}

class VirtualRoot extends VirtualNode
{
    constructor(mountPoint: HTMLElement)
    {
        super(mountPoint);
    }

    protected RealizeSelf(): void
    {
    }
    
    protected UpdateSelf(newNode: VirtualNode | null): VirtualNode | null
    {
        throw new Error("This should never be called");
    }

}

export class App
{
    constructor(private properties: AppProperties)
    {
        this.router = new Router(properties.routes);
        Injector.Register(Router, this.router);

        this.popupManager = new PopupManager(properties.mountPoint);
        Injector.Register(PopupManager, this.popupManager);

        Injector.Resolve<TitleService>(TitleService).format = "%title% | " + properties.title + " " + properties.version;

        this.root = new VirtualRoot(this.properties.mountPoint);

        window.addEventListener("load", this.OnWindowLoaded.bind(this), false);
    }

    //Event handlers
    private OnWindowLoaded()
    {
        const rootComponent = Injector.CreateComponent(this.properties.rootComponentClass);
        if(rootComponent.vNode !== null)
            this.root.AddChild(rootComponent.vNode);
    }

    //Private members
    private router: Router;
    private popupManager: PopupManager;
    private root: VirtualRoot;
}