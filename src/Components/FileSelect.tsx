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

import { Injectable } from "../ComponentManager";
import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";

type FileSelectInput = {
    class?: string;
    onChanged: (newValue: File | null) => void;
};

@Injectable
export class FileSelect extends Component<FileSelectInput>
{
    //Protected methods
    protected Render(): RenderValue
    {
        return <input class={this.input.class} type="file" onchange={this.OnValueChanged.bind(this)} />;
    }

    //Event handlers
    private OnValueChanged(event: Event)
    {
        const newValue = (event.target! as HTMLInputElement).files!.item(0);
        this.input.onChanged(newValue);
    }
}