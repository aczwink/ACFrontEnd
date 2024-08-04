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
import { Component, JSX_CreateElement, AutoCompleteTextLineEdit, AutoCompleteMultiSelectBox, KeyDisplayValuePair, AutoCompleteSelectBox } from "acfrontend";

export class FormsComponent extends Component
{
    constructor()
    {
        super();

        this.selection = [{ key: -1, displayValue: "cow"}, { key: -2, displayValue: "horse"}];
        this.singleSelection = null;
        this.text = "";
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            <p>
                The AutocompleteTextLineEdit provides text input with optional suggestions.
                The suggestions are a hint but the control can still deliver a meaningful value even if its entered text matches no suggestion.
                This class can not provide more than one auto-completable suggestion.
                If you need more than one selected suggestion, check the other control classes.
                Enter the letter "t" to get a lot of suggestions.
            </p>
            <AutoCompleteTextLineEdit value={this.text} loadTimeout={250} minChars={1}
                onChanged={newValue => this.text = newValue}
                onLoadSuggestions={this.OnLoadSuggestions.bind(this)} />

            <p>
                The AutoCompleteSelectBox provides the means to select a single item.
                The control is in an invalid state if it does not contain a single value of the possible choices.
                However, assuming that the number of choices is huge, it uses auto completion in order to suggest choices to the user which he can then select or unselect.
            </p>
            <AutoCompleteSelectBox selection={this.singleSelection}
                onChanged={newValue => this.singleSelection = newValue}
                onLoadSuggestions={this.OnLoadSuggestions2.bind(this)} />
                
            <p>
                The AutoCompleteMultiSelectBox is similar to the AutoCompleteSelectBox, while providing the means to select multiple items.
            </p>
            <AutoCompleteMultiSelectBox selection={this.selection} loadTimeout={250} minChars={1}
                onLoadSuggestions={this.OnLoadSuggestions2.bind(this)}
                onChanged={newValue => this.selection = newValue} />
        </fragment>;
    }

    //Private members
    private text: string;
    private singleSelection: KeyDisplayValuePair<number> | null;
    private selection: KeyDisplayValuePair<number>[];

    //Private methods
    private OnLoadSuggestions(searchText: string)
    {
        const suggestions = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];

        console.log("text: ", searchText);
        const found = suggestions.filter( v => v.includes(searchText) );

        return new Promise<string[]>(resolve => {
            setTimeout( () => resolve(found), 250); //imitate server query delay or so
        });
    }

    private async OnLoadSuggestions2(searchText: string)
    {
        const results = await this.OnLoadSuggestions(searchText);
        return results.map( (result, index) => {
            return { key: index, displayValue: result };
        })
    }
}