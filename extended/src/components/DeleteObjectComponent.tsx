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

import { APIResponse, Component, Injectable, JSX_CreateElement, ProgressSpinner, Router, RouterButton, RouterState } from "acfrontend";
import { Dictionary } from "acts-util-core";
import { APIResponseHandler } from "../services/APIResponseHandler";
import { ReplaceRouteParams } from "../Shared";

interface DeleteObjectComponentInput
{
    abortURL: string;
    deleteResource: (routeParams: Dictionary<string>) => Promise<APIResponse<void>>;
    postDeleteUrl: string;
}

@Injectable
export class DeleteObjectComponent extends Component<DeleteObjectComponentInput>
{
    constructor(private routerState: RouterState, private router: Router, private apiResponseHandler: APIResponseHandler)
    {
        super();

        this.loading = false;
    }
    
    protected Render(): RenderValue
    {
        if(this.loading)
            return <ProgressSpinner />;

        return <fragment>
            Are you sure that you PERMANENTLY want to delete this?
            <br />
            <div className="btn-group">
                <button type="button" className="btn btn-danger" onclick={this.OnDelete.bind(this)}>Delete</button>
                <RouterButton color="secondary" route={this.abortURL}>Cancel</RouterButton>
            </div>
        </fragment>;
    }

    //Private properties
    private get abortURL()
    {
        return ReplaceRouteParams(this.input.abortURL, this.routerState.routeParams);
    }

    private get postDeleteURL()
    {
        return ReplaceRouteParams(this.input.postDeleteUrl, this.routerState.routeParams);
    }

    //Event handlers
    private async OnDelete()
    {
        this.loading = true;
        const response = await this.input.deleteResource(this.routerState.routeParams);
        const result = await this.apiResponseHandler.ExtractDataFromResponseOrShowErrorMessageOnError(response);
        if(result.ok)
            this.router.RouteTo(this.postDeleteURL);
        else
            this.router.RouteTo(this.abortURL);
    }

    //State
    private loading: boolean;
}