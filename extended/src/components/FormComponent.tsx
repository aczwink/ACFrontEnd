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

import { APIResponse, BootstrapIcon, Component, Injectable, JSX_CreateElement, ProgressSpinner, RouterState } from "acfrontend";
import { ObjectEditorComponent, ObjectEditorContext } from "./ObjectEditorComponent";
import { Dictionary, OpenAPI, OpenAPISchemaValidator } from "acts-util-core";
import { NamedSchemaRegistry } from "../services/NamedSchemaRegistry";
import { APIResponseHandler } from "../services/APIResponseHandler";
import { BootstrapIconName } from "../../../dist/Bootstrap";

interface CreateObjectInput
{
    heading: string;
    loadContext?: (routeParams: Dictionary<string>) => Promise<any>;
    onSubmit: (routeParams: Dictionary<string>, data: any) => Promise<APIResponse<number | string | void>>;
    onSuccess: (routeParams: Dictionary<string>) => void;
    schema: OpenAPI.ObjectSchema;
    submitButtonIcon: BootstrapIconName;
    submitButtonText: string;
}

@Injectable
export class FormComponent<ObjectType extends object> extends Component<CreateObjectInput>
{
    constructor(private routerState: RouterState, private apiSchemaService: NamedSchemaRegistry, private apiResponseHandler: APIResponseHandler)
    {
        super();

        this.data = null;
        this.isValid = false;
        this.loading = false;
    }
    
    protected Render(): RenderValue
    {
        if(this.loading)
        {
            return <fragment>
                <ProgressSpinner />
                Standby...
            </fragment>;
        };

        return <form onsubmit={this.OnSave.bind(this)}>
            <h1>{this.input.heading}</h1>
            <ObjectEditorComponent context={this.context} object={this.data} schema={this.input.schema} onObjectUpdated={this.OnObjectUpdated.bind(this)} />
            <button disabled={!this.isValid} className="btn btn-primary" type="submit"><BootstrapIcon>{this.input.submitButtonIcon}</BootstrapIcon> {this.input.submitButtonText}</button>
        </form>;
    }

    //Event handlers
    override async OnInitiated(): Promise<void>
    {
        this.loading = true;

        this.context = await this.input.loadContext?.call(undefined, this.routerState.routeParams);
        const newData = this.apiSchemaService.CreateDefault(this.input.schema);
        this.OnObjectUpdated(newData);

        this.loading = false;
    }

    private OnObjectUpdated(newValue: ObjectType)
    {
        this.data = newValue;
        
        const validator = new OpenAPISchemaValidator(this.apiSchemaService.root);
        this.isValid = validator.Validate(this.data, this.input.schema);
    }

    private async OnSave(event: Event)
    {
        event.preventDefault();
        this.loading = true;

        const response = await this.input.onSubmit(this.routerState.routeParams, this.data);
        const result = await this.apiResponseHandler.ExtractDataFromResponseOrShowErrorMessageOnError(response);
        if(result.ok)
            this.input.onSuccess(this.routerState.routeParams);
        else
            this.loading = false;
    }

    //State
    private data: ObjectType | null;
    private context?: ObjectEditorContext;
    private isValid: boolean;
    private loading: boolean;
}