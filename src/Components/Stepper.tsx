/**
 * ACFrontEnd
 * Copyright (C) 2020,2022 Amir Czwink (amir130@hotmail.de)
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

import { Component, RenderComponentChildWithChildrenHelp } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { StepperPage } from "./StepperPage";

export class Stepper extends Component<{ onAccept: () => void }, RenderComponentChildWithChildrenHelp<StepperPage, RenderValue>[]>
{
    constructor()
    {
        super();

        this.currentPage = 0;
    }

    protected Render(): RenderValue
    {
        const pages = this.children;
        const currentPage = pages[this.currentPage];

        let prevButton;
        if(this.currentPage == 0)
            prevButton = null;
        else
            prevButton = <button type="button" className="outline" onclick={this.OnPrevious.bind(this)}>Previous</button>;

        let nextButtonText;
        if(this.currentPage == pages.length - 1)
            nextButtonText = "Finish";
        else
            nextButtonText = "Next";
        
        return <div className="stepper">
            <h4>{currentPage.properties.title}</h4>

            <div>{currentPage}</div>

            <div>
                <div className="row">
                    {prevButton}
                    <button type="button" disabled={!currentPage.properties.validate()} onclick={this.OnNext.bind(this)}>{nextButtonText}</button>
                </div>
                <div className="row">
                    <ul className="wizardStepper">
                        {...this.children.map( (_value, index) => this.RenderStepperDot(index) )}
                    </ul>
                </div>
            </div>
        </div>;
    }

    //Private members
    private currentPage: number;

    //Private methods
    private RenderStepperDot(index: number)
    {
        let className = "";
        if(index < this.currentPage)
            className = "finished";
        else if(index == this.currentPage)
            className = "active";
        return <li className={className}> </li>;
    }

    //Event handlers
    private OnNext()
    {
        if(this.currentPage < this.children.length - 1)
            this.currentPage++;
        else
            this.input.onAccept();
    }

    private OnPrevious()
	{
		if(this.currentPage > 0)
			this.currentPage--;
	}
}