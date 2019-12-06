/**
 * ACFrontEnd
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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

export class AutocompleteTextLineEdit extends Component
{
    constructor()
    {
        super();

        this.focused = false;
        this.choices = [];
        this.waitForSuggestions = false;
    }

    //Input
    input!: {
        value: string;
        hint?: string;
        onChanged: Function;
    };
    
    //Protected methods
    protected Render(): RenderNode
    {
        const className = "autoComplete" + (this.ShouldShowSuggestions() ? " withSuggestions" : "");
        const hintText = this.input.hint || "";

        return <span class={className}>
            <input type="text" value={this.input.value} placeholder={hintText} onkeyup={this.OnKeyUp.bind(this)} />
        </span>;
    }

    //Private members
    private focused: boolean;
    private choices: string[];
    private waitForSuggestions: boolean;

    //Private methods
    private ShouldShowSuggestions()
	{
		return this.focused && ((this.choices.length > 0) || this.waitForSuggestions);
    }
    
    //Event handlers
    private OnKeyUp(event: Event)
    {
        const newValue = (event.target! as HTMLInputElement).value;
        if(this.input.value !== newValue)
            this.input.onChanged(newValue);
    }
}