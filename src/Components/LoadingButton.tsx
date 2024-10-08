/**
 * ACFrontEnd
 * Copyright (C) 2020-2024 Amir Czwink (amir130@hotmail.de)
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
import { BootstrapColor } from "../Bootstrap";
import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";

interface LoadingButtonInput
{
    color: BootstrapColor;
    isLoading: boolean;
    enabled: boolean;
    onActivated: () => void;
}

export class LoadingButton extends Component<LoadingButtonInput, RenderValue>
{
    //Protected methods
    protected Render(): RenderValue
    {
        return <button type="button" className={"btn btn-" + this.input.color} disabled={!this.input.enabled} onclick={this.input.onActivated}>
            {this.input.isLoading ? <span className="spinner-border spinner-border-sm" aria-hidden="true"></span> : null}
            {this.children}
        </button>;
    }
}