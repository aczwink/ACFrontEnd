/**
 * ACFrontEnd
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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
import { JSX_CreateElement } from "../JSX_CreateElement";
import { ProgressSpinner } from "./ProgressSpinner";

interface LoadingButtonInput
{
    isLoading: boolean;
    onclick: EventHandler<MouseEvent>;
}

export class LoadingButton extends Component<LoadingButtonInput, SingleRenderValue>
{
    //Protected methods
    protected Render(): RenderValue
    {
        let className = "loadingButton";
        if(this.input.isLoading)
            className += " active";

        return <button type="button" class={className} disabled={this.input.isLoading} onclick={this.input.onclick}>
            <ProgressSpinner />
            {this.children[0]}
        </button>;
    }
}