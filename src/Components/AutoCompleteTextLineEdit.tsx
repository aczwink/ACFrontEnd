/**
 * ACFrontEnd
 * Copyright (C) 2019-2024 Amir Czwink (amir130@hotmail.de)
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
import { AutoCompleteHandler, ControllerConfig } from "./AutoCompleteHandler";
import { ProgressSpinner } from "./ProgressSpinner";

interface AutocompleteTextLineEditInput extends ControllerConfig
{
    value: string;
    hint?: string;

    onChanged: (newValue: string) => void;
    onLoadSuggestions: (searchText: string) => Promise<string[]>;
};

export class AutoCompleteTextLineEdit extends Component<AutocompleteTextLineEditInput>
{
    constructor()
    {
        super();
    }
    
    //Protected methods
    protected Render(): RenderValue
    {
        if(this.acHandler === undefined)
            return <ProgressSpinner />;

        const hintText = this.input.hint || "";

        return <div className="dropdown">
            <input className="form-control" data-bs-toggle="dropdown" type="text" value={this.input.value} placeholder={hintText}
                onfocus={this.acHandler.HandleFocus.bind(this.acHandler)}
                onkeydown={this.acHandler.HandleKeyDownEvent.bind(this.acHandler)}
                onkeyup={this.acHandler.HandleKeyUpEvent.bind(this.acHandler)}
                oninput={this.OnInput.bind(this)}
                />
            {this.acHandler.RenderDropDown()}
        </div>;
    }

    //Private members
    private acHandler?: AutoCompleteHandler<string>;
    
    //Event handlers
    public override OnInitiated()
    {
        this.acHandler = new AutoCompleteHandler<string>({
            onChoiceSelected: keyValue => this.input.onChanged(keyValue.key),
            onFilterTextChanged: () => null,
            onLoadSuggestions: async searchText => {
                const suggestions = await this.input.onLoadSuggestions(searchText);
                return suggestions.map(suggestion => ({
                    key: suggestion,
                    displayValue: suggestion
                }));
            },
            onUpdate: this.Update.bind(this),
            loadTimeout: this.input.loadTimeout,
            minChars: this.input.minChars,
            showSearchHelper: false
        });
    }

    private OnInput(event: InputEvent)
    {
        const newValue = (event.target! as HTMLInputElement).value;
        this.input.onChanged(newValue);
    }
}