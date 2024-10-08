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

import { Injectable } from "../decorators";
import { PopupManager } from "./PopupManager";

@Injectable
export class MenuManager
{
    constructor(private popupManager: PopupManager)
    {
    }

    //Public methods
    public OpenMenu(menu: RenderValue, event: MouseEvent)
    {
        const element: RenderValue = {
            type: "div",
            attributes: {},
            properties: {
                className: "contextMenu",
                onclick: () => popupRef.Close(),
                style: "left: " + event.clientX + "px; " + "top: " + event.clientY + "px"
            },
            children: [menu]
        }

        const popupRef = this.popupManager.OpenModal(element, { withBackdrop: false });
        return popupRef;
    }
}