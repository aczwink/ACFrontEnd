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
import { Dictionary } from "@aczwink/acts-util-core";

type Editor<T> = (data: T, valueChanged: (newValue: T | null) => void, format: string, context: any) => SingleRenderValue;
type FormatDataType = "number" | "string";
type Presenter<T> = (data: T) => string;

interface FormatEntry<T>
{
    editor?: Editor<T>;
    presenter?: Presenter<T>;
}

interface TypeEntry<T>
{
    direct: Dictionary<FormatEntry<T>>;
    regExpBased: { regExp: RegExp; entry: FormatEntry<T> }[];
}

@Injectable
export class CustomFormatRegistry
{
    constructor()
    {
        this.entries = {};
    }

    //Public methods
    public CreateEditor(type: "number", format: string, value: number, valueChanged: (newValue: number | null) => void, context: any): SingleRenderValue;
    public CreateEditor(type: "string", format: string, value: string, valueChanged: (newValue: string | null) => void, context: any): SingleRenderValue;
    public CreateEditor(type: FormatDataType, format: string, value: number | string, valueChanged: (newValue: any) => void, context: any)
    {
        const formatEntry = this.FindFormatEntry(type, format)!;
        return formatEntry.editor!(value, valueChanged, format, context);
    }

    public HasFormatEntry(type: FormatDataType, readOnly: boolean, format: string)
    {
        const formatEntry = this.FindFormatEntry(type, format);
        if(formatEntry === undefined)
            return false;

        if(readOnly)
            return formatEntry.presenter !== undefined;
        return formatEntry.editor !== undefined;
    }

    public Present(type: FormatDataType, format: string, value: number | string)
    {
        return this.FindFormatEntry(type, format)!.presenter!(value);
    }

    public RegisterFormat(type: "number", format: RegExp | string, entry: { editor?: Editor<number>, presenter?: Presenter<number> }): void;
    public RegisterFormat(type: "string", format: RegExp | string, entry: { editor?: Editor<string>, presenter?: Presenter<string> }): void;
    public RegisterFormat(type: FormatDataType, format: RegExp | string, entry: { editor?: Editor<any>, presenter?: Presenter<any> })
    {
        const formatEntry = this.GetOrInsertFormatEntry(type, format);
        formatEntry.editor = entry.editor;
        formatEntry.presenter = entry.presenter;
    }

    //Private methods
    private FindFormatEntry(type: FormatDataType, format: string)
    {
        const typeEntry = this.entries[type];
        if(typeEntry === undefined)
            return undefined;

        const direct = typeEntry.direct[format];
        if(direct !== undefined)
            return direct;

        for (const entry of typeEntry.regExpBased)
        {
            if(format.match(entry.regExp) !== null)
                return entry.entry;
        }
        return undefined;
    }

    private GetOrInsertFormatEntry(type: FormatDataType, format: RegExp | string)
    {
        let typeEntry = this.entries[type];
        if(typeEntry === undefined)
            this.entries[type] = typeEntry = { direct: {}, regExpBased: [] };

        if(format instanceof RegExp)
        {
            const formatEntry = typeEntry.regExpBased.find(x => x.regExp === format);
            if(formatEntry === undefined)
            {
                const entry: FormatEntry<number | string> = {};
                typeEntry.regExpBased.push({ regExp: format, entry });
                return entry;
            }
            return formatEntry.entry;
        }

        const formatEntry = typeEntry.direct[format];
        if(formatEntry === undefined)
            typeEntry.direct[format] = {};
        return typeEntry.direct[format]!;
    }

    //State
    private entries: Dictionary<TypeEntry<number | string>>;
}