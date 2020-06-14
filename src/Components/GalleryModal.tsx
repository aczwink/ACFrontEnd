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
import { RenderNode } from "../VirtualNode";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { Image } from "./Gallery";
import { Injectable } from "../ComponentManager";
import { PopupRef } from "../Controller/PopupRef";

@Injectable
export class GalleryModal extends Component
{
    input!: {
        startImageIndex: number;
        images: Image[];
    }

    constructor(private popupRef: PopupRef)
    {
        super();

        this.currentImageIndex = 0;
    }

    protected Render(): RenderNode
    {
        let leftStyle = "";
		if(!this.HasPreviousImage())
            leftStyle = "display: none";

        let rightStyle = "";
        if(!this.HasNextImage())
            rightStyle = "display: none";
            
        return <div>
            <button type="button" class="leftArrow" style={leftStyle} onclick={this.OnGoLeft.bind(this)}>{"\u2190"}</button>
            <img src={this.input.images[this.currentImageIndex].url} />
            <button type="button" class="rightArrow" style={rightStyle} onclick={this.OnGoRight.bind(this)}>{"\u2192"}</button>
        </div>;
    }

    //Private members
    private currentImageIndex: number;

    //Private methods
    private HasNextImage()
    {
        return this.currentImageIndex+1 < this.input.images.length;
    }

    private HasPreviousImage()
    {
        return this.currentImageIndex > 0;
    }

    //Event handlers
    private OnGoLeft(event: Event)
	{
        event.preventDefault();
        event.stopPropagation();

        this.currentImageIndex -= 1;
	}
	
	private OnGoRight(event: Event)
	{
        event.preventDefault();
        event.stopPropagation();
        
		this.currentImageIndex += 1;
    }

    public OnInitiated()
    {
        this.currentImageIndex = this.input.startImageIndex;
        this.popupRef.keydownEvents.Subscribe({ next: this.OnKeyDown.bind(this) })
    }

    private OnKeyDown(event: KeyboardEvent)
    {
        if((event.keyCode === 37) && this.HasPreviousImage())
            this.OnGoLeft(event);
        else if((event.keyCode === 39) && this.HasNextImage())
            this.OnGoRight(event);
    }
}