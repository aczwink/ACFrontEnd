/**
 * ACFrontEnd
 * Copyright (C) 2024-2025 Amir Czwink (amir130@hotmail.de)
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

import { Dictionary } from "@aczwink/acts-util-core";
import { Injectable } from "../decorators";

interface LanguageDictionary
{
    dictionary: object;
    fallbackCode?: string;
}

@Injectable
export class I18nManager
{
    constructor()
    {
        this._activeLanguage = "";
        this.dictionaries = {};
    }

    //Properties
    public get activeLanguage()
    {
        return this._activeLanguage;
    }

    public set activeLanguage(code: string)
    {
        this._activeLanguage = code;
    }

    //Public methods
    public AddLanguage(code: string, dictionary: object, fallbackCode?: string)
    {
        this.dictionaries[code] = {
            dictionary,
            fallbackCode
        };

        if(this._activeLanguage.length === 0)
            this._activeLanguage = code;
    }

    public LookupKey(key: string)
    {
        const result = this.LookupKeyInLanguageChain(key.split("."), this._activeLanguage);
        if(result === undefined)
            return "TODO: MISSING KEY '" + key + "' for language '" + this._activeLanguage + "'";
        return result;
    }

    //State
    private _activeLanguage: string;
    private dictionaries: Dictionary<LanguageDictionary>;

    //Private methods
    private LookupKeyInDictionary(keys: string[], dictionary: any)
    {
        for (const key of keys)
            dictionary = dictionary[key];
        if(typeof dictionary !== "string")
            throw new Error("i18n key '" + keys.join(".") + "' does not resolve to a string.");
        return dictionary;
    }

    private LookupKeyInLanguageChain(keys: string[], code: string): string | undefined
    {
        const lang = this.dictionaries[code];
        if(lang === undefined)
            throw new Error("Language '" + code + "' has not been defined.");

        const value = this.LookupKeyInDictionary(keys, lang.dictionary);
        if(value === undefined)
        {
            if(lang.fallbackCode !== undefined)
                return this.LookupKeyInLanguageChain(keys, lang.fallbackCode);
            return undefined;
        }
        return value;
    }
}