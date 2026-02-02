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

import { BootstrapIcon, Component, Injectable, JSX_CreateElement, NavItem, ProgressSpinner, RouterComponent, RouterState } from "acfrontend";
import { IdBoundObjectAction, RenderBoundAction } from "../domain/IdBoundActions";
import { Dictionary } from "@aczwink/acts-util-core";

interface ObjectType
{
    key: string;
    displayName: string;
    icon?: string;
}

interface CatType
{
    catName: string;
    objectTypes: ObjectType[];
}

interface SideNavComponentInput
{
    actions: IdBoundObjectAction<any, any>[];
    baseRoute: string;
    cats: CatType[];
    formHeading: (routeParams: Dictionary<string>) => string;
}

@Injectable
export class MultiPageNavComponent extends Component<SideNavComponentInput>
{
    constructor(private routerState: RouterState)
    {
        super();

        this.baseRoute = "";
        this.title = null;
    }
    
    protected Render(): RenderValue
    {
        if(this.title === null)
            return <ProgressSpinner />;

        return <fragment>
            <div className="row align-items-center">
                <div className="col-auto"><h2>{this.title}</h2></div>
                {...this.input.actions.map(x => <div className="col-auto">{RenderBoundAction(this.input.baseRoute, this.routerState.routeParams, x, () => null)}</div>)}
            </div>
            <div className="row">
                <div className="col-1">
                    {...this.input.cats.map(this.RenderCat.bind(this))}
                </div>
                <div className="col"><RouterComponent /></div>
            </div>
        </fragment>;
    }

    //Private methods
    private RenderCat(cat: CatType)
    {
        if(cat.catName !== "")
        {
            return <fragment>
                <h5>{cat.catName}</h5>
                {this.RenderCat({ catName: "", objectTypes: cat.objectTypes })}
            </fragment>;
        }

        return <ul className="nav nav-pills flex-column">
            {...cat.objectTypes.map(x => <NavItem route={this.baseRoute + "/" + x.key}><span className="pe-1">{this.RenderIcon(x)}</span>{x.displayName}</NavItem>)}
        </ul>;
    }

    private RenderIcon(objectType: ObjectType)
    {
        const icon = objectType.icon;
        
        if(icon === undefined)
            return undefined;
        
        return <BootstrapIcon>{icon}</BootstrapIcon>;
    }

    //Event handlers
    override OnInitiated(): void
    {
        this.baseRoute = RouterState.ReplaceRouteParams(this.input.baseRoute, this.routerState.routeParams).join("/");
        this.title = this.input.formHeading(this.routerState.routeParams);
    }

    //State
    private baseRoute: string;
    private title: string | null;
}