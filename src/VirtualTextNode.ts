/**
 * ACFrontEnd
 * Copyright (C) 2019-2021 Amir Czwink (amir130@hotmail.de)
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

export class VirtualTextNode extends VirtualNode
{
    constructor(text: RenderText)
    {
        super();
        this.text = text;
    }

    //Protected methods
    protected CloneSelf(): VirtualNode
    {
        return new VirtualTextNode(this.text);
    }

    protected RealizeSelf(): Node
    {
        return document.createTextNode(this.text.toString());
    }

    protected UpdateSelf(newNode: VirtualNode): VirtualNode
    {
        if(newNode instanceof VirtualTextNode)
        {
            this.text = newNode.text;
            if(this.domNode !== null)
                this.domNode.nodeValue = newNode.text.toString();
            return this;
        }
        return newNode;
        /*	
        if(this._domNode !== null)
            newNode.ReplaceNodeWithSelf(this._domNode);
		*/
    }

    //Private members
    private text: RenderText;
}