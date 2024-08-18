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
import { DataLink } from "../DataBinding";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { Injectable } from "../decorators";

interface LineEditDirectValue
{
    onChanged: (newValue: string) => void;
    value: string;
}
interface LineEditLinkValue
{
    link: DataLink<string>;
}

type LineEditInput =
{
    className?: string;
    maxLength?: number;
    password?: boolean;
    placeholder?: string;
} &  (LineEditDirectValue | LineEditLinkValue)

@Injectable
export class LineEdit extends Component<LineEditInput>
{
    //Protected methods
    protected Render(): RenderValue
    {
        const type = this.input.password === true ? "password" : "text";
        const value = ("value" in this.input) ? this.input.value : this.input.link.value;
        return <input className={"form-control " + this.input.className} type={type} value={value} onchange={this.OnValueChanged.bind(this)} onkeyup={this.OnValueChanged.bind(this)} placeholder={this.input.placeholder} maxLength={this.input.maxLength} />;
    }

    //Event handlers
    private OnValueChanged(event: Event)
    {
        const newValue = (event.target! as HTMLInputElement).value;
        const value = ("value" in this.input) ? this.input.value : this.input.link.value;
        if(value !== newValue)
        {
            if("onChanged" in this.input)
                this.input.onChanged(newValue);
            else
                this.input.link.Set(newValue);
        }
    }
}