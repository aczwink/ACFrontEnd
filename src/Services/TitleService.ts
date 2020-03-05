/**
 * ACFrontEnd
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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
import { Injectable } from "../Injector";

@Injectable
export class TitleService
{
    constructor()
    {
        this.titleFormat = "";
        this.titleText = "";
    }

    //Properties
    public get format()
    {
        return this.titleFormat;
    }

    public set format(newFormat: string)
    {
        this.titleFormat = newFormat;
        this.UpdateDocumentTitle();
    }

    public get title()
    {
        return this.titleText;
    }

    public set title(newTitle: string)
    {
        this.titleText = newTitle;
        this.UpdateDocumentTitle();
    }

    //Private members
    private titleFormat: string;
    private titleText: string;

    //Private methods
    private UpdateDocumentTitle()
    {
        document.title = this.titleFormat.replace("%title%", this.titleText);
    }
}