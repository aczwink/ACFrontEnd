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

import { Injectable } from "../ComponentManager";
import { PopupManager } from "./PopupManager";

interface InfoMessageOptions
{
    duration?: number;
}

@Injectable
export class InfoMessageManager
{
    constructor(private popupManager: PopupManager)
    {
    }

    //Public methods
    public ShowMessage(renderNode: RenderValue, options: InfoMessageOptions)
    {
        throw new Error("InfoMessageManager.ShowMessage");
        /*
        const message = new VirtualInstance(InfoMessage, null, TransformRenderNodeToVirtualNode(renderNode));
        const ref = this.popupManager.OpenPopup("infoMessagesContainer", message);

        if(options.duration !== undefined)
            setTimeout(ref.Close.bind(ref), options.duration);
        */
    }
}