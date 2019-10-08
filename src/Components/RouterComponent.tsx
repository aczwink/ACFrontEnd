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
import { Component } from "../Component";
import { Router } from "../Services/Router/Router";
import { Injectable, Instantiatable } from "../Injector";
import { VirtualInstance } from "../VirtualInstance";
import { RenderNode } from "../VirtualElement";
import { RouterStateNode } from "../Services/Router/RouterState";

@Injectable
export class RouterComponent extends Component
{
    //Constructor
    constructor(private router: Router)
    {
        super();

        this.router.state.Subscribe(() => this.Update());
    }

    //Protected methods
    protected Render(): RenderNode
    {
        const value = this.router.state.Get();
        if(value.root === null)
            return null;
        const component = this.FindComponent(value.root);
        if(component === null)
            return null;
        return new VirtualInstance(component, null, []);
    }

    //Private methods
    private FindComponent(node: RouterStateNode): Instantiatable<Component> | null
    {
        if(node.route.component !== undefined)
            return node.route.component;
        if(node.child !== undefined)
            return this.FindComponent(node.child);
        return null;
    }
}