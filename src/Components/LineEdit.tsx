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
import { Injectable } from "../ComponentManager";

interface LineEditInput
{
    className?: string;
    maxLength?: number;
    password?: boolean;
    placeholder?: string;
    value: string;

    onChanged: (newValue: string) => void;
}

@Injectable
export class LineEdit extends Component<LineEditInput>
{
    //Protected methods
    protected Render(): RenderValue
    {
        const type = this.input.password === true ? "password" : "text";
        return <input className={"form-control " + this.input.className} type={type} value={this.input.value} onchange={this.OnValueChanged.bind(this)} onkeyup={this.OnValueChanged.bind(this)} placeholder={this.input.placeholder} maxLength={this.input.maxLength} />;
    }

    //Event handlers
    private OnValueChanged(event: Event)
    {
        const newValue = (event.target! as HTMLInputElement).value;
        if(this.input.value !== newValue)
            this.input.onChanged(newValue);
    }
}