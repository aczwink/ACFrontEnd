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
import { Injectable } from "../decorators";

@Injectable
export class InfoMessage extends Component<{ type: BootstrapColor }, RenderValue>
{
    protected Render(): RenderValue
    {
        const className = "alert alert-" + this.input.type + " m-0 d-flex";
        return <div className="toast show" aria-live="assertive" aria-atomic="true">
            <div className="toast-body p-0">
                <div className={className}>
                    {this.children}
                    <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" />
                </div>
            </div>
        </div>;
    }
}