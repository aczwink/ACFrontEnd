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

import { JSX_CreateElement } from "../JSX_CreateElement";
import { ProgressSpinner } from "./ProgressSpinner";

export interface KeyDisplayValuePair<KeyType>
{
    key: KeyType;
    displayValue: string;
}

export interface ControllerConfig
{
    loadTimeout?: number;
    minChars?: number;
}

interface HandlerPrivateConfig
{
    showSearchHelper: boolean;
}

interface ControllerInput<KeyType> extends ControllerConfig, HandlerPrivateConfig
{
    onChoiceSelected: (choice: KeyDisplayValuePair<KeyType>) => void;
    onFilterTextChanged: (filterText: string) => void;
    onLoadSuggestions: (searchText: string) => Promise<KeyDisplayValuePair<KeyType>[]>;
    onUpdate: () => void;
}

export class AutoCompleteHandler<KeyType>
{
    constructor(private input: ControllerInput<KeyType>)
    {
        this._filterText = "";
        this.choices = [];
        this._focused = false;
        this.selectedIndex = 0;
        this.waitForSuggestions = false;

        this.QueryChoices(""); //preload data
    }

    //Properties
    public get filterText()
    {
        return this._filterText;
    }

    public get focused()
    {
        return this._focused;
    }

    //Public methods    
    public HandleFocus()
    {
        this._focused = true;
        this.input.onUpdate();
    }

    public HandleKeyDownEvent(event: KeyboardEvent)
    {
        switch(event.keyCode)
		{
        case 13: //enter
            event.preventDefault(); //stop automatic form submit
            this.OnChooseChoice(this.choices[this.selectedIndex]);
		break;
		}
    }

    public HandleKeyUpEvent(event: KeyboardEvent)
    {
        switch(event.keyCode)
        {
            case 13: //enter
                this.OnChooseChoice(this.choices[this.selectedIndex]);
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
                    this.input.onUpdate();
                }
            return;
            case 40: //arrow down
                event.preventDefault();
                if(this.choices.length > 0)
                {
                    if(this.selectedIndex+1 == this.choices.length)
                        this.selectedIndex = 0;
                    else
                        this.selectedIndex = (this.selectedIndex + 1);
                    this.input.onUpdate();
                }
            return;
        }

        if(this.timeOut !== undefined)
            clearTimeout(this.timeOut);

        const newValue = (event.target! as HTMLInputElement).value;
        if(this._filterText !== newValue)
        {
            this._filterText = newValue;
            this.input.onFilterTextChanged(newValue);
        }

        this.timeOut = setTimeout(this.OnStoppedTyping.bind(this), this.loadTimeout);
    }

    public RenderDropDown()
    {
        return <div className="dropdown-menu">
            {this.RenderSearchHelper()}
            {this.RenderSuggestions()}
        </div>;
    }

    //Private members
    private _filterText: string;
    private _focused: boolean;
    private choices: KeyDisplayValuePair<KeyType>[];
    private selectedIndex: number;
    private timeOut?: number;
    private waitForSuggestions: boolean;

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
    private async QueryChoices(filterText: string)
    {
        var results = await this.input.onLoadSuggestions(filterText);
        if(this._filterText == filterText)
        {
            //are we still the newest filter, or was another one typed in while the async request was going on
            this.choices = results;
            this.waitForSuggestions = false;
            this.input.onUpdate();
        }
    }

    private RenderSearchHelper()
    {
        if(this.input.showSearchHelper)
        {
            return <fragment>
                <div className="px-2 py-1">
                    <input className="form-control" type="text" value={this.filterText} onkeyup={this.HandleKeyUpEvent.bind(this)} />
                </div>
                <div className="dropdown-divider" />
            </fragment>;
        }
        return null;
    }

    private RenderSuggestions()
	{
		if(!this.ShouldShowSuggestions())
            return null;
            
        return <fragment>
            {!this.waitForSuggestions ? null : <ProgressSpinner />}
            {...this.choices.map( (choice, idx) => {
                const className = "dropdown-item" + (idx === this.selectedIndex ? " active" : "");
                return <li><button className={className} type="button" onclick={this.OnChooseChoice.bind(this, choice)}>{choice.displayValue}</button></li>;
            })}
        </fragment>;
    }

    private ShouldShowSuggestions()
	{
		return this.focused && ((this.choices.length > 0) || this.waitForSuggestions);
    }

    private async TryQueryChoices()
	{
        const currentFilterText = this._filterText;
		if(currentFilterText.length >= this.minChars)
		{
            this.waitForSuggestions = true;
            this.input.onUpdate();

            await this.QueryChoices(currentFilterText);
		}
		else
		{
            this.choices = [];
            this.input.onUpdate();
        }
    }

    private Unfocus()
	{
		(document.activeElement as HTMLInputElement).blur();
		this._focused = false;
	}

    //Event handlers
    private OnChooseChoice(choice: KeyDisplayValuePair<KeyType>)
    {
        this._focused = false;
        this.selectedIndex = this.choices.indexOf(choice);        
        this.input.onChoiceSelected(choice);

        this._filterText = "";
        this.input.onFilterTextChanged(this._filterText);
    }

    private OnStoppedTyping(event: Event)
	{
		if(this.timeOut != undefined)
		{
			clearTimeout(this.timeOut);
			this.timeOut = undefined;
		}
		this.TryQueryChoices();
    }
}