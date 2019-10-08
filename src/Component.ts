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
import { RenderNode } from "./VirtualElement";
import { VirtualTextNode } from "./VirtualTextNode";

export abstract class Component
{
    //Constructor
    constructor()
    {
        this._vNode = null;
    }

    //Properties
    get domNode(): Node
    {
        if( (this._vNode === null) )
			this.UpdateSync();
		return this._vNode!.domNode;
    }

    //Abstract
    protected abstract Render(): RenderNode;

    //Public methods
    Update()
    {
        this.NextTick(this.UpdateSync.bind(this));
    }

    UpdateSync()
    {
        let newNode = this.Render();

        //is there something to render?
		if((newNode === null) || (newNode === undefined)) //can be undefined if Render does not return something
		{
            //nothing to render
            //TODO: this is currently needed for a "special case" (the one below).
            //If the component did render null before and now updates it isn't mounted within the parent.
            //So this update will update the vnode but not the real dom node as it is not existing.
            newNode = new VirtualTextNode("");
        }
        
        if((typeof newNode === "string") || (typeof newNode === "number"))
			newNode = new VirtualTextNode(newNode);

        //special case: check if we did not have a node before
		if(this._vNode === null)
		{
			this._vNode = newNode as VirtualNode;
			//TODO: see some lines above, where: (this._vNode = new VTextNode("");)
			return;
        }
        
        //we keep our real node but update it
		this._vNode = this._vNode.Update(newNode);
    }

    //Private methods
    private NextTick(func: Function)
    {
        setTimeout(func, 0);
    }

    //Private members
    private _vNode: VirtualNode | null;
}