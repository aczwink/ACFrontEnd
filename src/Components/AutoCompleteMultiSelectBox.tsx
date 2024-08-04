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
import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { ProgressSpinner } from "../main";
import { AutoCompleteHandler, ControllerConfig, KeyDisplayValuePair } from "./AutoCompleteHandler";

interface AutoCompleteMultiSelectBoxInput<KeyType> extends ControllerConfig
{
    selection: KeyDisplayValuePair<KeyType>[];

    onChanged: (newValue: KeyDisplayValuePair<KeyType>[]) => void;
    onLoadSuggestions: (searchText: string) => Promise<KeyDisplayValuePair<KeyType>[]>;
}

export class AutoCompleteMultiSelectBox<KeyType> extends Component<AutoCompleteMultiSelectBoxInput<KeyType>>
{
    constructor()
    {
        super();

        this.selectedKey = null;
    }

    protected Render(): RenderValue
    {
        if(this.acHandler === undefined)
            return <ProgressSpinner />;

        //tabIndex={-1} onblur={this.acHandler!.HandleBlur.bind(this)} onfocus={this.acHandler!.HandleFocus.bind(this)} onkeyup={this.OnSelectedKeyUp.bind(this, sel)}
        return <div className="dropdown form-control">
            {...this.input.selection.map(this.RenderBadge.bind(this))}
            <input style="border: none; background: transparent; outline: none; min-width: 80%" type="text" data-bs-toggle="dropdown" value={this.acHandler.filterText}
                onfocus={this.OnFocus.bind(this)}
                onkeyup={this.OnKeyUp.bind(this)} />
            {this.acHandler.RenderDropDown()}
        </div>;
    }

    //Private members
    private acHandler?: AutoCompleteHandler<KeyType>;
    private selectedKey: KeyType | null;

    //Private methods
    private RenderBadge(selection: KeyDisplayValuePair<KeyType>)
    {
        const selected = this.selectedKey === selection.key;
        const color = selected ? "info" : "primary";
        const className = "badge rounded-pill text-bg-" + color;
        return <span onclick={this.OnSelectBadge.bind(this, selection)} className={className} style="cursor: pointer;">
            {selection.displayValue}
        </span>;
    }
    
    //Event handlers
    private OnChooseChoice(choice: KeyDisplayValuePair<KeyType>)
	{
        const selection = this.input.selection.Clone();
        selection.push(choice);

        this.input.onChanged(selection);
    }

    private OnFocus()
    {
        this.selectedKey = null;
        this.acHandler!.HandleFocus();
    }

    public override OnInitiated()
    {
        this.acHandler = new AutoCompleteHandler({
            onChoiceSelected: this.OnChooseChoice.bind(this),
            onFilterTextChanged: () => null,
            onLoadSuggestions: this.input.onLoadSuggestions,
            onUpdate: this.Update.bind(this),
            loadTimeout: this.input.loadTimeout,
            minChars: this.input.minChars,
            showSearchHelper: false
        });
    }

    private OnSelectBadge(selected: KeyDisplayValuePair<KeyType>)
    {
        this.selectedKey = selected.key;
    }

    private OnKeyUp(event: KeyboardEvent)
	{
        //8 is backspace, 46 is delete
		if(event.keyCode == 8 || event.keyCode == 46)
		{
            if(this.acHandler!.filterText.length === 0)
            {
                if(this.selectedKey === null)
                {
                    if(this.input.selection.length > 0)
                    {
                        this.selectedKey = this.input.selection[this.input.selection.length - 1].key;
                        return;
                    }
                }
                else
                {
                    const selection = this.input.selection.Clone();
                    selection.Remove(selection.findIndex(x => x.key === this.selectedKey));
                    this.input.onChanged(selection);
                    this.Update();
                    return;
                }
            }
		}
        
        this.acHandler!.HandleKeyUpEvent(event);
	}
}