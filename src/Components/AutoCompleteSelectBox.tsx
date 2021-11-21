/**
 * ACFrontEnd
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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
    constructor()
    {
        super();

        this.activeFilter = false;
    }

    //Protected methods
    protected Render(): RenderValue
    {
        if(this.controller === undefined)
            return <ProgressSpinner />;
            
        const className = "autoCompleteMultiSelectBox" + (this.controller.ShouldShowSuggestions() ? " withSuggestions" : "") + (this.controller.focused ? " focused" : "");

        return <span class={className}>
            {this.RenderContent()}
            {this.controller.RenderSuggestions()}
        </span>;
    }

    //Private members
    private controller?: AutoCompleteController<KeyType>;
    private activeFilter: boolean;

    //Private methods
    private RenderContent()
    {
        if((this.input.selection === null) || this.activeFilter)
        {
            return <input type="text" value={this.controller!.filterText}
                onblur={this.OnBlur.bind(this)}
                onfocus={this.controller!.HandleFocus.bind(this.controller)}
                onkeyup={this.controller!.HandleKeyUpEvent.bind(this.controller)}
                />;
        }

        return <ul>
            <li tabindex={-1} onblur={this.controller!.HandleBlur.bind(this.controller)}
                onfocus={this.OnFocusSelectedItem.bind(this)}>
                {this.input.selection.displayValue}
            </li>
            <li> </li>
        </ul>; //TODO: the second li should show the arrow
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
        this.activeFilter = false;
    }

    public OnInitiated()
    {
        this.controller = new AutoCompleteController<KeyType>({
            onChoiceSelected: choice => {
                this.activeFilter = false;
                this.input.onChanged(choice);
            },
            onFilterTextChanged: () => null,
            onLoadSuggestions: this.input.onLoadSuggestions,
            onUpdate: this.Update.bind(this),
            loadTimeout: this.input.loadTimeout,
            minChars: this.input.minChars
        });
    }

    private OnFocusSelectedItem(event: Event)
    {
        this.controller!.HandleFocus();
        this.activeFilter = true;
        this.controller!.Search(this.input.selection!.displayValue);
        this.UpdateSync();
        this.TryFocus();
    }
}