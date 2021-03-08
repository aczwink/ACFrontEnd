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

export class VirtualFragment extends VirtualNode
{
    constructor(children?: VirtualNode[])
    {
        super();
        this.children = children;
    }

    //Protected methods
    protected CloneSelf(): VirtualNode
    {
        return new VirtualFragment();
    }

    protected RealizeSelf(): null
    {
        return null;
    }

    protected UpdateSelf(newNode: VirtualNode | null): VirtualNode | null
    {
        if(newNode instanceof VirtualFragment)
        {
            this.UpdateChildren(newNode);
            return this;
        }
        return newNode;
    }
}