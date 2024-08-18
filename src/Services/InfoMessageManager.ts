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
import { InfoMessage } from "../Components/InfoMessage";
import { Injectable } from "../decorators";
import { PopupManager } from "./PopupManager";

interface InfoMessageOptions
{
    duration?: number;
    type: "success" | "danger" | "info";
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
        const message: SingleRenderValue = {
            type: InfoMessage,
            properties: { type: options.type },
            children: [renderNode]
        };
        const ref = this.popupManager.OpenPopup("toast-container", message, { className: "position-fixed top-0 start-50 translate-middle-x p-5" });

        if(options.duration === undefined)
            options.duration = this.ComputeDuration(options) * 1000;
        setTimeout(ref.Close.bind(ref), options.duration);
    }

    //Private methods
    private ComputeDuration(options: InfoMessageOptions)
    {
        switch(options.type)
        {
            case "danger":
                return 8;
            case "info":
            case "success":
                return 4;
        }
    }
}