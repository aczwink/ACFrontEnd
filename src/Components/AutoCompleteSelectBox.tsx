/**
 * ACFrontEnd
 * Copyright (C) 2021-2022 Amir Czwink (amir130@hotmail.de)
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
import { AutoCompleteController, ControllerConfig, KeyDisplayValuePair } from "./AutoCompleteController";
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
        if(this.controller === undefined)
            return <ProgressSpinner />;

        const displayValue = (this.input.selection === null) ? "Select an option" : this.input.selection.displayValue;
        return <div className="dropdown">
            <button className="form-select" type="button" data-bs-toggle="dropdown" aria-expanded="false" onclick={this.OnFocus.bind(this)}>{displayValue}</button>
            <div className="dropdown-menu">
                <div className="px-2 py-1">
                    <input className="form-control" type="text" value={this.controller!.filterText} onkeyup={this.controller!.HandleKeyUpEvent.bind(this.controller)} />
                </div>
                <div className="dropdown-divider" />
                {this.controller.RenderSuggestions()}
            </div>
        </div>;
    }

    //Private members
    private controller?: AutoCompleteController<KeyType>;

    //Private methods
    private RenderContent()
    {
        /*if((this.input.selection === null) || this.activeFilter)
        {
                onblur={this.OnBlur.bind(this)}
                onfocus={this.controller!.HandleFocus.bind(this.controller)}
                />;
        }*/
        /*
        <li tabIndex={-1} onblur={this.controller!.HandleBlur.bind(this.controller)}>
            </li>
             */
    }

    private TryFocus()
    {
        const inputNode = (this.vNode?.domNode as Element).getElementsByTagName("input")[0];
        if(inputNode)
            inputNode.focus();
    }

    //Event handlers
    private OnBlur()
    {
        this.controller!.HandleBlur();
    }

    public override OnInitiated()
    {
        this.controller = new AutoCompleteController<KeyType>({
            onChoiceSelected: choice => this.input.onChanged(choice),
            onFilterTextChanged: () => null,
            onLoadSuggestions: this.input.onLoadSuggestions,
            onUpdate: this.Update.bind(this),
            loadTimeout: this.input.loadTimeout,
            minChars: this.input.minChars
        });
    }

    private OnFocus(event: FocusEvent)
    {
        this.controller!.HandleFocus();
        this.UpdateSync();
        this.TryFocus();
    }
}