/**
 * ACFrontEnd
 * Copyright (C) 2021-2024 Amir Czwink (amir130@hotmail.de)
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
import { AutoCompleteHandler, ControllerConfig, KeyDisplayValuePair } from "./AutoCompleteHandler";
import { ProgressSpinner } from "./ProgressSpinner";

interface AutoCompleteSelectBoxInput<KeyType> extends ControllerConfig
{
    selection: KeyDisplayValuePair<KeyType> | null;

    onChanged: (newValue: KeyDisplayValuePair<KeyType>) => void;
    onLoadSuggestions: (searchText: string) => Promise<KeyDisplayValuePair<KeyType>[]>;
};

export class AutoCompleteSelectBox<KeyType> extends Component<AutoCompleteSelectBoxInput<KeyType>>
{
    //Protected methods
    protected Render(): RenderValue
    {
        if(this.acHandler === undefined)
            return <ProgressSpinner />;

        const displayValue = (this.input.selection === null) ? "Select an option" : this.input.selection.displayValue;
        return <div className="dropdown">
            <button className="form-select" type="button" data-bs-toggle="dropdown" aria-expanded="false" onclick={this.OnFocus.bind(this)}>{displayValue}</button>
            {this.acHandler.RenderDropDown()}
        </div>;
    }

    //Private members
    private acHandler?: AutoCompleteHandler<KeyType>;

    private TryFocus()
    {
        const inputNode = (this.vNode?.domNode as Element).getElementsByTagName("input")[0];
        if(inputNode)
            inputNode.focus();
    }

    //Event handlers
    public override OnInitiated()
    {
        this.acHandler = new AutoCompleteHandler<KeyType>({
            onChoiceSelected: choice => this.input.onChanged(choice),
            onFilterTextChanged: () => null,
            onLoadSuggestions: this.input.onLoadSuggestions,
            onUpdate: this.Update.bind(this),
            loadTimeout: this.input.loadTimeout,
            minChars: this.input.minChars,
            showSearchHelper: true,
        });
    }

    private OnFocus(event: FocusEvent)
    {
        this.acHandler!.HandleFocus();
        this.UpdateSync();
        this.TryFocus();
    }
}