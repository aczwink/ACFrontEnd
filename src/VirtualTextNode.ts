/**
 * ACFrontEnd
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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
import { VirtualNode } from "./VirtualNode";

export type TextLiteral = string | number;

export class VirtualTextNode implements VirtualNode
{
    constructor(text: TextLiteral)
    {
        this.text = text;
		this._domNode = null;
    }

    //Properties
    get domNode(): Node
    {
        if(this._domNode === null)
			this._domNode = document.createTextNode(this.text.toString());
		return this._domNode;
    }

    //Public methods
    public Update(newNode: VirtualNode): VirtualNode
    {
        throw new Error("Method not implemented.");
    }

    //Private members
    private text: TextLiteral;
    private _domNode: Node | null;
}