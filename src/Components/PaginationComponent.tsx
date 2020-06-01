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
import { Select } from "./Select";

export class PaginationComponent extends Component
{
    input!: {
        count: number;
        offset: number;
        size: number;

        onOffsetChanged: (newOffset: number) => void;
        onSizeChanged: (newSize: number) => void;
    };

    //Protected methods
    protected Render(): RenderNode
    {
        return <div class="paginator">
            <div class="limitSelection">
                Items per page:
                <Select onChanged={this.OnItemCountChanged.bind(this)}>
                    {...this.RenderLimitChoices()}
                </Select>
            </div>
            <div class="statusText">{this.GetPageFromToText()}</div>
            <ul class="paginationNavigation">
                {this.CreatePageLink("\u2039", this.page - 1)}
				{this.CreatePageLink("\u203A", this.page + 1)}
            </ul>
        </div>;
    }

    //Private properties
    private get nPages()
	{
		return Math.ceil(this.input.count / this.input.size);
    }
    
    private get page()
	{
		return Math.floor(this.input.offset / this.input.size);
    }
    
    private set page(page)
	{
        this.input.onOffsetChanged(page * this.input.size);
	}

    //Private methods
    private CreatePageLink(text: string, page: number, isActive = false)
    {
        let className;
        if((page < 0) || (page >= this.nPages))
			className = "disabled";
		else if((this.page == page))
		{
			if(isActive)
				className = "active";
			else
				className = "disabled";
        }
        
        return <li>
            <a class={className} onclick={this.OnPageLinkClicked.bind(this, page)}>{text}</a>
        </li>;
    }

    private GetPageFromToText()
	{
		if(this.input.count > 0)
			return (this.input.offset+1) + " - " + Math.min(this.input.offset+this.input.size, this.input.count) + " of " + this.input.count;
		return "";
    }

    private RenderLimitChoices()
    {
        const choices = [10, 25, 50, 100];

        const options = choices.map(choice => <option selected={choice === this.input.size}>{choice.toString()}</option>);
        options.push(<option selected={!choices.Contains(this.input.size)}>custom</option>);

        return options;
    }
    
    //Event handlers
    private OnItemCountChanged(selection: string[])
    {
        const selected = selection[0];
        if(selected === "custom")
            console.error("not implemented");
        else
            this.input.onSizeChanged(parseInt(selected));
    }

    //Event handlers
	private OnPageLinkClicked(page: number, event: MouseEvent)
	{
        event.preventDefault();

		this.page = page;
	}
}