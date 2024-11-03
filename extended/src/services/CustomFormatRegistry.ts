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

import { Injectable } from "acfrontend";
import { Dictionary } from "acts-util-core";

type Editor<T> = (data: T, valueChanged: (newValue: T | null) => void) => SingleRenderValue;
type FormatDataType = "number" | "string";
type Presenter<T> = (data: T) => string;

interface Entry<T>
{
    editor?: Editor<T>;
    presenter?: Presenter<T>;
}

@Injectable
export class CustomFormatRegistry
{
    constructor()
    {
        this.entries = {};
    }

    //Public methods
    public CreateEditor(type: "number", format: string, value: number, valueChanged: (newValue: number | null) => void): SingleRenderValue;
    public CreateEditor(type: "string", format: string, value: string, valueChanged: (newValue: string | null) => void): SingleRenderValue;
    public CreateEditor(type: FormatDataType, format: string, value: number | string, valueChanged: (newValue: any) => void)
    {
        const formatEntry = this.GetFormatEntry(type, format);
        return formatEntry.editor!(value, valueChanged);
    }

    public HasFormatEntry(type: FormatDataType, readOnly: boolean, format: string)
    {
        const typeEntry = this.entries[type];
        if(typeEntry === undefined)
            return false;
        const formatEntry = typeEntry[format];
        if(readOnly)
            return formatEntry?.presenter !== undefined;
        return formatEntry?.editor !== undefined;
    }

    public Present(type: FormatDataType, format: string, value: number | string)
    {
        return this.entries[type]![format]!.presenter!(value);
    }

    public RegisterFormatEditor(type: "number", format: string, presenter: Editor<number>): void;
    public RegisterFormatEditor(type: "string", format: string, presenter: Editor<string>): void;
    public RegisterFormatEditor(type: FormatDataType, format: string, formatter: Editor<any>)
    {
        const formatEntry = this.GetFormatEntry(type, format);
        formatEntry.editor = formatter;
    }

    public RegisterFormatPresenter(type: "number", format: string, presenter: Presenter<number>): void;
    public RegisterFormatPresenter(type: "string", format: string, presenter: Presenter<string>): void;
    public RegisterFormatPresenter(type: FormatDataType, format: string, presenter: Presenter<any>)
    {
        const formatEntry = this.GetFormatEntry(type, format);
        formatEntry.presenter = presenter;
    }

    //Private methods
    private GetFormatEntry(type: FormatDataType, format: string)
    {
        const typeEntry = this.entries[type];
        if(typeEntry === undefined)
            this.entries[type] = {};

        const formatEntry = this.entries[type]![format];
        if(formatEntry === undefined)
            this.entries[type]![format] = {};
        return this.entries[type]![format]!;
    }

    //State
    private entries: Dictionary<Dictionary<Entry<number | string>>>;
}