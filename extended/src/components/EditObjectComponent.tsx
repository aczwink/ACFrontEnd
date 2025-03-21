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

import { APIResponse, Component, Injectable, JSX_CreateElement, ProgressSpinner, Router, RouterState } from "acfrontend";
import { ObjectEditorComponent, ObjectEditorContext } from "./ObjectEditorComponent";
import { Dictionary, OpenAPI } from "acts-util-core";
import { APIResponseHandler } from "../services/APIResponseHandler";
import { ReplaceRouteParams } from "../Shared";

interface ObjectInput<ObjectType>
{
    formTitle: (ids: any, object: any) => string;
    loadContext?: (routeParams: Dictionary<string>) => Promise<any>;
    postUpdateUrl: string;
    requestObject: (routeParams: Dictionary<string>) => Promise<APIResponse<ObjectType>>;
    schema: OpenAPI.ObjectSchema;
    updateResource: (routeParams: Dictionary<string>, object: any) => Promise<APIResponse<void>>;
}

@Injectable
export class EditObjectComponent<ObjectType> extends Component<ObjectInput<ObjectType>>
{
    constructor(private routerState: RouterState, private apiResponseHandler: APIResponseHandler, private router: Router)
    {
        super();

        this.data = null;
        this.heading = "";
    }

    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>{this.heading}</h1>
            <form onsubmit={this.OnSave.bind(this)}>
                <ObjectEditorComponent context={this.context} object={this.data} schema={this.input.schema} onObjectUpdated={this.OnObjectUpdated.bind(this)} />
                <br />
                <button className="btn btn-primary" type="submit">Save</button>
            </form>
        </fragment>;
    }

    //Event handlers
    private OnObjectUpdated(newValue: ObjectType)
    {
        this.data = newValue;
    }

    override async OnInitiated(): Promise<void>
    {
        this.context = await this.input.loadContext?.call(undefined, this.routerState.routeParams);

        const response = await this.input.requestObject(this.routerState.routeParams);
        const result = await this.apiResponseHandler.ExtractDataFromResponseOrShowErrorMessageOnError(response);
        if(result.ok)
            this.data = result.value;
        this.heading = this.input.formTitle(this.routerState.routeParams, this.data);
    }

    private async OnSave(event: Event)
    {
        event.preventDefault();

        const data = this.data;
        this.data = null; //show loader

        const response = await this.input.updateResource(this.routerState.routeParams, data);
        await this.apiResponseHandler.ShowErrorMessageOnErrorFromResponse(response);

        const updateUrl = ReplaceRouteParams(this.input.postUpdateUrl, this.routerState.routeParams)
        this.router.RouteTo(updateUrl);
    }

    //State
    private context?: ObjectEditorContext;
    private data: any | null;
    private heading: string;
}