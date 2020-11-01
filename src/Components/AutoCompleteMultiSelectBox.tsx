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
import { JSX_CreateElement } from "../JSX_CreateElement";
import { ProgressSpinner } from "./ProgressSpinner";

export interface KeyDisplayValuePair<KeyType>
{
    key: KeyType;
    displayValue: string;
}

type AutoCompleteMultiSelectBoxInput<KeyType> = {
    selection: KeyDisplayValuePair<KeyType>[];
    loadTimeout?: number;
    minChars?: number;

    onChanged: (newValue: KeyDisplayValuePair<KeyType>[]) => void;
    onLoadSuggestions: (searchText: string) => Promise<KeyDisplayValuePair<KeyType>[]>;
}

export class AutoCompleteMultiSelectBox<KeyType> extends Component<AutoCompleteMultiSelectBoxInput<KeyType>>
{
    constructor()
    {
        super();

        this.choices = [];
        this.focused = false;
        this.inputText = "";
        this.selectedIndex = 0;
        this.waitForSuggestions = false;
    }

    protected Render(): RenderValue
    {
        const className = "autoCompleteMultiSelectBox" + (this.ShowSuggestions() ? " withSuggestions" : "") + (this.focused ? " focused" : "");

        return <span class={className}>
            <ul>
                {...this.input.selection.map(sel => <li tabindex={-1} onblur={() => this.focused = false} onfocus={() => this.focused = true} onkeyup={this.OnSelectedKeyUp.bind(this, sel)}>
                    {sel.displayValue}
                </li>)}
                <li>
                    <input type="text" value={this.inputText}
                        onblur={() => this.focused = false}
                        onfocus={() => this.focused = true}
                        onkeyup={this.OnKeyUp.bind(this)} />
                </li>
            </ul>
            {this.RenderSuggestions()}
        </span>;
        //new LineEdit({ placeholder: this.__props.placeholder)
    }

    //Private members
    private choices: KeyDisplayValuePair<KeyType>[];
    private focused: boolean;
    private inputText: string;
    private selectedIndex: number;
    private waitForSuggestions: boolean;
    private timeOut?: number;

    //Private properties
    private get minChars()
    {
        return this.input.minChars || 3;
    }

    private get loadTimeout()
    {
        return this.input.loadTimeout || 1000;
    }

    //Private methods
	private async QueryChoices()
	{		
		if(this.inputText.length >= this.minChars)
		{
            this.waitForSuggestions = true;

            const currentFilterText = this.inputText;
            var results = await this.input.onLoadSuggestions(currentFilterText);
            if(this.inputText == currentFilterText)
            {
                //are we still the newest filter, or was another one typed in while the async request was going on
                this.choices = results;
                this.waitForSuggestions = false;
            }
		}
		else
		{
			this.choices = [];
		}
    }
    
    private RenderSuggestions()
	{
		if(!this.ShowSuggestions())
            return null;
            
        return <ul class="suggestions">
            {!this.waitForSuggestions ? null : <li class="disabled" onmousedown={event => event.preventDefault()/* keep input in focus */}><ProgressSpinner /></li>}
            {...this.choices.map( (choice, idx) => {
                const className = this.selectedIndex == idx ? "selected" : "";
                return <li class={className} onmousedown={this.OnChooseChoice.bind(this, choice)}>{choice.displayValue}</li>;
            })}
        </ul>;
    }
    
    private ShowSuggestions()
	{
		return this.focused && ((this.choices.length > 0) || this.waitForSuggestions);
    }
    
    //Event handlers
    private OnChooseChoice(choice: KeyDisplayValuePair<KeyType>)
	{
        const selection = this.input.selection.Clone();
        selection.push(choice);

        this.input.onChanged(selection);
        
        this.inputText = "";
		this.choices = [];
		this.focused = false;
    }
    
    private OnKeyUp(event: KeyboardEvent)
    {
        const oldText = this.inputText;
        this.inputText = (event.target! as HTMLInputElement).value;

        switch(event.keyCode)
        {
            case 8: //backspace
                if( (oldText.length == 0) && (this.input.selection.length > 0) )
                    break; //TODO: SELECT LAST ITEM
            return;
            case 13: //enter
                this.OnChooseChoice(this.choices[this.selectedIndex]);
            return;
            case 27: //esc
			    //TODO:
            return;
            case 38: //arrow up
                if(this.choices.length > 0)
                {
                    if(this.selectedIndex == 0)
                        this.selectedIndex = this.choices.length - 1;
                    else
                        this.selectedIndex = (this.selectedIndex - 1)
                }
            return;
            case 40: //arrow down
                if(this.choices.length > 0)
                {
                    if(this.selectedIndex+1 == this.choices.length)
                        this.selectedIndex = 0;
                    else
                        this.selectedIndex = (this.selectedIndex + 1)
                }
            return;
        }

        if(this.timeOut != undefined)
            clearTimeout(this.timeOut);
            
        this.timeOut = setTimeout(this.OnStoppedTyping.bind(this), this.loadTimeout);
    }

    private OnSelectedKeyUp(choice: KeyDisplayValuePair<KeyType>, event: KeyboardEvent)
	{
        //8 is backspace, 46 is delete
		if(event.keyCode == 8 || event.keyCode == 46)
		{
            const selection = this.input.selection.Clone();
            selection.Remove(selection.indexOf(choice));
        
            this.input.onChanged(selection);

			this.Update();
		}
	}

    private OnStoppedTyping(event: Event)
	{
		if(this.timeOut != undefined)
		{
			clearTimeout(this.timeOut);
			this.timeOut = undefined;
		}
		this.QueryChoices();
	}
}