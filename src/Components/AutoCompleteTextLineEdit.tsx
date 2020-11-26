/**
 * ACFrontEnd
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
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
import { ProgressSpinner } from "./ProgressSpinner";

type AutocompleteTextLineEditInput = {
    value: string;
    hint?: string;
    loadTimeout?: number;
    minChars?: number;

    onChanged: (newValue: string) => void;
    onLoadSuggestions: (searchText: string) => Promise<string[]>;
};

export class AutoCompleteTextLineEdit extends Component<AutocompleteTextLineEditInput>
{
    constructor()
    {
        super();

        this.focused = false;
        this.choices = [];
        this.selectedIndex = 0;
        this.waitForSuggestions = false;
    }
    
    //Protected methods
    protected Render(): RenderValue
    {
        const className = "autoComplete" + (this.ShouldShowSuggestions() ? " withSuggestions" : "");
        const hintText = this.input.hint || "";

        return <span class={className}>
            <input type="text" value={this.input.value} placeholder={hintText}
                onblur={() => this.focused = false}
                onfocus={() => this.focused = true}
                onkeydown={this.OnKeyDown.bind(this)}
                onkeyup={this.OnKeyUp.bind(this)}
                oninput={this.OnInput.bind(this)}
                />
            {this.RenderSuggestions()}
        </span>;
    }

    //Private members
    private focused: boolean;
    private choices: string[];
    private waitForSuggestions: boolean;
    private currentFilterText?: string;
    private selectedIndex: number;
    private timeOut?: number;

    //Private properties
    private get loadTimeout()
    {
        return this.input.loadTimeout || 1000;
    }

    private get minChars()
    {
        return this.input.minChars || 3;
    }

    //Private methods
	private async QueryChoices()
	{
		var currentFilterText = this.input.value;
		
		if(currentFilterText.length >= this.minChars)
		{
			if(currentFilterText !== this.currentFilterText)
			{
				this.currentFilterText = currentFilterText;
				this.waitForSuggestions = true;
				
				var results = await this.input.onLoadSuggestions(currentFilterText);
				if(this.currentFilterText == currentFilterText)
				{
					//are we still the newest filter, or was another one typed in while the async request was going on
					this.choices = results;
					this.waitForSuggestions = false;
				}
			}
		}
		else
		{
			this.choices = [];
		}
    }
    
    private RenderSuggestions()
    {
        if(!this.ShouldShowSuggestions())
            return null;
        return <ul class="suggestions">
            {!this.waitForSuggestions ? null : <li class="disabled" onmousedown={event => event.preventDefault() /* keep input in focus */}><ProgressSpinner /></li>}
            {...this.choices.map( (choice, index) => {
                const className = this.selectedIndex == index ? "selected" : "";
                return <li class={className} onmousedown={this.OnChooseChoice.bind(this, choice)}>{choice}</li>;
            })}
            </ul>;
    }

    private ShouldShowSuggestions()
	{
		return this.focused && ((this.choices.length > 0) || this.waitForSuggestions);
    }

    private Unfocus()
	{
		(document.activeElement as HTMLInputElement).blur();
		this.focused = false;
	}
    
    //Event handlers
    private OnChooseChoice(choice: string)
	{
		this.input.onChanged(choice);
		this.choices = [];
    }

    private OnKeyDown(event: KeyboardEvent)
    {
        switch(event.keyCode)
		{
		case 13: //enter
			if(this.selectedIndex < this.choices.length)
			{
				this.input.onChanged(this.choices[this.selectedIndex]);
				this.choices = [];
				//this.__Unfocus();
				event.preventDefault(); //stop automatic form submit
			}
			return;
		}
    }
    
    private OnKeyUp(event: KeyboardEvent)
    {
        switch(event.keyCode)
        {
            case 13: //enter
            return; //does not count as typing
            case 27: //esc
                this.Unfocus();
            return;
            case 38: //arrow up
                event.preventDefault();
                if(this.choices.length > 0)
                {
                    if(this.selectedIndex == 0)
                        this.selectedIndex = this.choices.length - 1;
                    else
                        this.selectedIndex = (this.selectedIndex - 1)
                }
            return;
            case 40: //arrow down
                event.preventDefault();
                if(this.choices.length > 0)
                {
                    if(this.selectedIndex+1 == this.choices.length)
                        this.selectedIndex = 0;
                    else
                        this.selectedIndex = (this.selectedIndex + 1)
                }
            return;
        }

        if(this.timeOut !== undefined)
            clearTimeout(this.timeOut);
            
        const newValue = (event.target! as HTMLInputElement).value;
        if(this.input.value !== newValue)
            this.input.onChanged(newValue);

        this.timeOut = setTimeout(this.OnStoppedTyping.bind(this), this.loadTimeout);
    }

    private OnInput(event: InputEvent)
    {
        const newValue = (event.target! as HTMLInputElement).value;
        this.input.onChanged(newValue);
    }

    private OnStoppedTyping(event: Event)
	{
		if(this.timeOut != null)
		{
			clearTimeout(this.timeOut);
			this.timeOut = undefined;
		}
		this.QueryChoices();
	}
}