/**
 * ACFrontEnd
 * Copyright (C) 2024 Amir Czwink (amir130@hotmail.de)
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
import { Injectable } from "../decorators";

type DateTimePickerInput = {
    value: Date | number;
    onChanged: (newValue: Date) => void;
};

@Injectable
export class DateTimePicker extends Component<DateTimePickerInput>
{
    //Protected methods
    protected Render(): RenderValue
    {
        const dt = (typeof this.input.value === "number") ? new Date(this.input.value) : this.input.value;
        const str = dt.getFullYear() + "-" + this.PadNumber(dt.getMonth()+1, 2) + "-" + this.PadNumber(dt.getDate(), 2) + "T" + this.PadNumber(dt.getHours(), 2) + ":" + this.PadNumber(dt.getMinutes(), 2);
        return <input className="form-control" type="datetime-local" value={str} onchange={this.OnChanged.bind(this)} />;
    }

    //Private methods
    private PadNumber(x: number, length: number)
    {
        let str = x.toString();
        while(str.length < length)
            str = "0" + str;
        return str;
    }

    //Event handlers
    private OnChanged(event: Event)
    {
        const newValue = (event.target! as HTMLInputElement).valueAsNumber;
        const d = new Date(newValue);
        const d2 = new Date(newValue + d.getTimezoneOffset() * 60 * 1000);
        this.input.onChanged(d2);
    }
}