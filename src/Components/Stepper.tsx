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

export class Stepper extends Component
{
    constructor()
    {
        super();

        this.currentPage = 0;
    }

    protected Render(): RenderNode
    {
        let prevButtonText;
        if(this.currentPage == 0)
            prevButtonText = "Cancel";
        else
            prevButtonText = "Previous";

        let nextButtonText;
        
        //if(this.currentPage == this.__pages.length - 1)
        nextButtonText = "Finish";
        //else
        nextButtonText = "Next";
        
        return <div class="wizard">
            <div>
                <div class="row">
                    <button type="button" class="outline">{prevButtonText}</button>
                    <button type="button">{nextButtonText}</button>
                </div>
            </div>
        </div>;

        //on: { click: this.__OnPrevious.bind(this)} }
    }

    //Private members
    private currentPage: number;
}