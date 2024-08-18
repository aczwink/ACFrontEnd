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

type TooltipPosition = "below" | "leftOf";
interface TooltipProperties
{
    event?: MouseEvent;
    position: TooltipPosition;
}

@Injectable
export class TooltipManager
{
    constructor(private popupManager: PopupManager)
    {
    }

    //Public methods
    public ShowTooltip(renderNode: RenderValue, properties: TooltipProperties)
    {
        const coords = this.ComputeCoordinates(properties);

        const tooltip: RenderValue = {
            type: "div",
            attributes: {},
            properties: { className: "tooltip " + properties.position, style: "left: " + coords.x + "px; top: " + coords.y + "px" },
            children: [
                {
                    type: "div",
                    attributes: {},
                    properties: { className: "arrow" + this.TranslateTooltipPositionToArrowClass(properties.position) },
                    children: []
                },
                {
                    type: "div",
                    attributes: {},
                    properties: null,
                    children: [renderNode]
                }
            ]
        };

        return this.popupManager.OpenModeless(tooltip);
    }

    //Private methods
    private ComputeCoordinates(properties: TooltipProperties)
    {
        let x, y;
        if(properties.event !== undefined)
        {
            const element = properties.event.target as HTMLElement;
            x = element.offsetLeft;
            y = element.offsetTop;

            switch(properties.position)
            {
                case "below":
                    x += element.offsetWidth / 2;
                    y += element.offsetHeight;
                break;
                case "leftOf":
                    y += element.offsetHeight / 2;
                break;
            }
        }

        return { x, y };
    }

    private TranslateTooltipPositionToArrowClass(pos: TooltipPosition)
    {
        switch(pos)
        {
            case "below":
                return " up";
            case "leftOf":
                return " right";
        }
    }
}