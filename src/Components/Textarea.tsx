/**
 * ACFrontEnd
 * Copyright (C) 2020,2022 Amir Czwink (amir130@hotmail.de)
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
import { Injectable } from "../ComponentManager";

type TextAreaInput = {
    value: string;
    onChanged: (newValue: string) => void;
    columns?: number;
    onKeyDown?: EventHandler<KeyboardEvent>;
    rows?: number;
};

@Injectable
export class Textarea extends Component<TextAreaInput>
{
    //Protected methods
    protected Render(): RenderValue
    {
        const cols = (this.input.columns || 80).toString();
        const rows = (this.input.rows || 24).toString();

        return <textarea className="form-control" cols={cols} rows={rows} onkeydown={this.input.onKeyDown} oninput={this.OnValueChanged.bind(this)}>{this.input.value}</textarea>
    }

    //Event handlers
    private OnValueChanged(event: InputEvent)
    {
        const newValue = (event.target! as HTMLTextAreaElement).value;
        if(this.input.value !== newValue)
            this.input.onChanged(newValue);
    }
}