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
import { Injector, Instantiatable } from "@aczwink/acts-util-core";

export const RootInjector = new Injector;
RootInjector.RegisterInstance(Injector, RootInjector);


import { Component } from "./Component";
import { Router } from "./Services/Router/Router";
import { Routes } from "./Services/Router/Route";
import { PopupManager } from "./Services/PopupManager";
import { TitleService } from "./Services/TitleService";
import { VirtualInstance } from "./VirtualTree/VirtualInstance";
import { VirtualNode } from "./VirtualTree/VirtualNode";
import { ThemingService } from "./Services/ThemingService";

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
    constructor(mountPoint: Node)
    {
        super(mountPoint);

        this._injector = RootInjector;
    }

    //Protected methods
    protected CloneSelf(): VirtualNode
    {
        return new VirtualRoot(this.domNode!);
    }

    protected RealizeSelf(): null
    {
        return null;
    }
    
    protected UpdateSelf(newNode: VirtualNode | null): VirtualNode | null
    {
        throw new Error("This should never be called");
    }

}

class App
{
    constructor(private properties: AppProperties)
    {
        this.root = new VirtualRoot(this.properties.mountPoint);

        this.popupManager = new PopupManager(this.root);
        RootInjector.RegisterInstance(PopupManager, this.popupManager);

        const router = new Router(properties.routes);


        RootInjector.Resolve(TitleService).format = "%title% | " + properties.title + " " + properties.version;

        RootInjector.Resolve(ThemingService).SetPreferredUserTheme();

        window.addEventListener("load", this.OnWindowLoaded.bind(this), false);
    }

    //Event handlers
    private OnWindowLoaded()
    {
        const vNode = new VirtualInstance(this.properties.rootComponentClass as any, null);
        this.root.AddChild(vNode);
    }

    //Private state
    private popupManager: PopupManager;
    private root: VirtualRoot;
}

export function BootstrapApp(properties: AppProperties)
{
    const app = new App(properties);
}