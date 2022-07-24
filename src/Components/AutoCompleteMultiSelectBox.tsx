/**
 * ACFrontEnd
 * Copyright (C) 2020-2022 Amir Czwink (amir130@hotmail.de)
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
import { AutoCompleteController, ControllerConfig, KeyDisplayValuePair } from "./AutoCompleteController";

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
    }

    protected Render(): RenderValue
    {
        if(this.controller === undefined)
            return <ProgressSpinner />;

        const className = "autoCompleteMultiSelectBox" + (this.controller.ShouldShowSuggestions() ? " withSuggestions" : "") + (this.controller.focused ? " focused" : "");

        return <span className={className}>
            <ul>
                {...this.input.selection.map(sel => <li tabIndex={-1} onblur={this.controller!.HandleBlur.bind(this)} onfocus={this.controller!.HandleFocus.bind(this)} onkeyup={this.OnSelectedKeyUp.bind(this, sel)}>
                    {sel.displayValue}
                </li>)}
                <li>
                    <input type="text" value={this.controller.filterText}
                        onblur={this.controller.HandleBlur.bind(this)}
                        onfocus={this.controller.HandleFocus.bind(this)}
                        onkeyup={this.controller.HandleKeyUpEvent.bind(this)} />
                </li>
            </ul>
            {this.controller.RenderSuggestions()}
        </span>;
        //new LineEdit({ placeholder: this.__props.placeholder)
    }

    //Private members
    private controller?: AutoCompleteController<KeyType>;
    
    //Event handlers
    private OnChooseChoice(choice: KeyDisplayValuePair<KeyType>)
	{
        const selection = this.input.selection.Clone();
        selection.push(choice);

        this.input.onChanged(selection);
    }

    public override OnInitiated()
    {
        this.controller = new AutoCompleteController({
            onChoiceSelected: this.OnChooseChoice.bind(this),
            onFilterTextChanged: () => null,
            onLoadSuggestions: this.input.onLoadSuggestions,
            onUpdate: this.Update.bind(this),
            loadTimeout: this.input.loadTimeout,
            minChars: this.input.minChars
        });
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
}