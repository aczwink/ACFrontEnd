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

import { Component, RenderNode, JSX_CreateElement, Injectable, PopupRef, TooltipManager } from "acfrontend";

@Injectable
export class TooltipComponent extends Component
{
    constructor(private tooltipManager: TooltipManager)
    {
        super();
    }

    protected Render(): RenderNode
    {
        return <fragment>
            <button type="button" onmouseenter={this.OnMouseEntered.bind(this)} onmouseout={this.OnMouseLeft.bind(this)}>Hover over me!</button>
        </fragment>
    }

    //Private members
    private tooltipRef?: PopupRef;

    //Event handlers
    private OnMouseEntered(event: MouseEvent)
    {
        this.tooltipRef = this.tooltipManager.ShowTooltip("Hello World", { position: "leftOf", event });
    }

    private OnMouseLeft()
    {
        this.tooltipRef?.Close();
        this.tooltipRef = undefined;
    }
}