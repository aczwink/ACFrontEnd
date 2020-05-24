/**
 * ACFrontEnd
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
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
import { VirtualNode, RenderNode } from "./VirtualNode";
import { TransformRenderNodeToVirtualNode } from "./RenderNodeTransformer";

export abstract class Component
{
    //Constructor
    constructor()
    {
        this._vNode = null;
    }

    //Properties
    get vNode(): VirtualNode | null
    {
        if( (this._vNode === null) )
            this.UpdateSync();
        return this._vNode;
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
        const newNode = this.Render();
        const newVirtualNode = TransformRenderNodeToVirtualNode(newNode);

        if(this._vNode === null) //special case: component was never used before
        {
            this._vNode = newVirtualNode;
            return;
        }

        this._vNode = this._vNode.Update(newVirtualNode);
    }

    //Private methods
    private NextTick(func: Function)
    {
        setTimeout(func, 0);
    }

    //Event handlers
    public OnInitiated()
    {
    }

    public OnInputChanged()
    {
        this.Update();
    }

    public OnUnmounted()
    {
    }

    //Private members
    private _vNode: VirtualNode | null;
}