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

import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { PopupManager } from "../Services/PopupManager";
import { Injectable } from "../decorators";
import { GalleryModal } from "./GalleryModal";

export interface GalleryImage
{
    url: string;
    caption?: string;
}

interface Images
{
    imgClass?: string;
    images: GalleryImage[];
}

@Injectable
export class Gallery extends Component<Images>
{
    constructor(private popupManager: PopupManager)
    {
        super();
    }

    //Protected methods
    protected Render(): RenderValue
    {
        return <fragment>{this.input.images.map(this.RenderImage.bind(this))}</fragment>;
    }

    //Private methods
    private RenderImage(image: GalleryImage, index: number)
    {
        const imgClass = this.input.imgClass ? this.input.imgClass : "";
        return <fragment>
            <img onclick={this.OnImageClicked.bind(this, index)} className={imgClass} src={image.url} />
            {image.caption}
        </fragment>;
    }

    //Event handlers
    private OnImageClicked(imgIndex: number, event: MouseEvent)
    {
        event.stopPropagation();

        this.popupManager.OpenModal(<GalleryModal startImageIndex={imgIndex} images={this.input.images} />, { className: "galleryModal" });
    }
}