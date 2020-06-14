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

import { Component, RenderNode, Gallery, JSX_CreateElement } from "acfrontend";

export class GalleryComponent extends Component
{
    protected Render(): RenderNode
    {
        const images = {
            images: this.GetRandomPics(6)
        };
        return <Gallery images={images} />;
    }

    //Private methods
    private GetRandomPics(count: number)
    {
        const images = [];

        for(let i = 0; i < count; i++)
        {
            images.push({ url: "https://picsum.photos/seed/" + (i+1) + "/536/354" });
        }

        return images;
    }
}