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
import { Component, JSX_CreateElement, JSX_Fragment, Injectable, Navigation, NavItem, BootstrapIcon } from "acfrontend";
import { SessionComponent } from "./SessionComponent";
import { LayoutManager } from "../services/LayoutManager";
import { MainRoutingComponent } from "./SpecializedRoutingComponent";

@Injectable
export class RootComponent extends Component
{
    constructor(private layoutManager: LayoutManager)
    {
        super();
    }
    
    protected Render()
    {
        const navbar = this.layoutManager.layout.navbar;

        return <>
            <Navigation>
                {navbar.map(y => <ul className="nav nav-pills">
                    {y.map(x => <NavItem route={"/" + x.routingKey}><BootstrapIcon>{x.icon}</BootstrapIcon> {x.displayText}</NavItem>)}
                </ul>)}
                <SessionComponent />
            </Navigation>
            <div className="container-fluid">
                <MainRoutingComponent />
            </div>
        </>;
    }
}