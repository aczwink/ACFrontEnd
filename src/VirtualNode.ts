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
import { Injector } from "acts-util-core";

import { MountPoint, DOM } from "./DOM";

export type RenderText = string | number | boolean;
type RenderOther = null | undefined;

export type RenderNode = VirtualNode | RenderText | RenderOther;

export abstract class VirtualNode
{
    constructor(domNode?: Node)
    {
        this._nextSibling = null;
        this.parent = null;
        this._prevSibling = null;

        if(domNode === undefined)
        {
            this.domNode = null;
            this.mounted = false;
            this.realized = false;
        }
        else
        {
            this.domNode = domNode;
            this.mounted = true;
            this.realized = true;
        }
    }

    //Properties
    public get children()
    {
        return this._children;
    }

    public set children(children: Array<VirtualNode> | undefined)
    {
        this.DropAllChildren();
        if(children !== undefined)
        {
            for (let index = 0; index < children.length; index++)
            {
                const child = children[index];
                this.AddChild(child);
            }
        }
    }

    public get injector()
    {
        if(this._injector === undefined)
            return this.parent!.injector;
        return this._injector;
    }

    public set injector(newInjector: Injector)
    {
        this._injector = newInjector;
    }

    //Public methods
    public AddChild(newChild: VirtualNode)
    {
        if(this._children === undefined)
            this._children = [];

        if(this._children.length > 0)
            newChild.previousSibling = this._children[this._children.length - 1];

        newChild.parent = this;
        this._children.push(newChild);

        if(this.mounted)
        {
            const mountPoint = newChild.FindMountPoint();
            if(mountPoint === null)
                throw new Error("TODO");
            newChild.Mount(mountPoint);
        }
    }

    public Mount(mountPoint: MountPoint): void
    {
        this.EnsureRealized();
        if(this.domNode !== null)
            DOM.Mount(this.domNode, mountPoint);
        else
            this.MountChildren(mountPoint);
        this.mounted = true;
    }

    public MountAsChildOf(mountPoint: Node)
    {
        this.Mount({ mountPointNode: mountPoint, reference: "appendChild" });
    }

    public RemoveChild(child: VirtualNode)
    {
        if(this._children === undefined)
            throw new Error("HERE");

        this._children.splice(this._children.indexOf(child), 1);
        child.Unmount();
    }

    public Unmount()
    {
        if(this.domNode !== null)
        {
            DOM.Unmount(this.domNode);
        }
        else if(this._children !== undefined)
        {
            for (let index = 0; index < this._children.length; index++)
            {
                const child = this._children[index];
                child.Unmount();
            }
        }
        this.mounted = false;
        this.OnUnmounted();
    }

    public Update(newVNode: VirtualNode | null): VirtualNode | null
    {
        const updatedNode = this.UpdateSelf(newVNode);
        if(updatedNode !== this)
        {
            if(newVNode === null)
                throw new Error("HERE"); //this.RemoveVirtualNode(oldVNode);
            else
                this.Replace(newVNode);
        }

        return updatedNode;
    }

    //Protected members
    /**
     * Null means for a realized node that no dom node representation is available for this node.
     * Currently this is only true for VirtualInstance and VirtualFragment.
     * If this has not been realized, dom node is always null.
     */
    protected domNode: Node | null;
    protected _injector?: Injector;

    //Protected abstract
    protected abstract RealizeSelf(): void;
    protected abstract UpdateSelf(newNode: VirtualNode | null): VirtualNode | null;

    //Protected methods
    protected UpdateChildren(newNode: VirtualNode | null)
	{
        if(newNode === null)
        {
            throw new Error("HERE");
        }
        if(newNode._children === undefined)
        {
            this.DropAllChildren();
            return;
        }
        if(this._children === undefined)
            this._children = [];

		var i;
		for(i = 0; i < this._children.length; i++)
		{
			if(i >= newNode._children.length)
			{
                //drop child
                this._children[i].Unmount();
				this._children.splice(i, 1);
				i--;
			}
            else
                this._children[i] = this._children[i].Update(newNode._children[i])!;
		}
        for(; i < newNode._children.length; i++)
            this.AddChild(newNode._children[i]);
    }

    //Event handlers
    protected OnUnmounted()
    {
    }

    //Private members
    /**
     * Undefined if the node does not have children.
     * This is currently only true for VirtualTextNode
     */
    private _children?: Array<VirtualNode>;
    private parent: VirtualNode | null;
    private mounted: boolean;
    private realized: boolean;
    private _nextSibling: VirtualNode | null;
    private _prevSibling: VirtualNode | null;

    //Private properties
    private set nextSibling(newNext: VirtualNode | null)
    {
        this._nextSibling = newNext;
        if( newNext !== null)
            newNext._prevSibling = this;
    }

    private set previousSibling(newPrev: VirtualNode | null)
    {
        this._prevSibling = newPrev;
        if(newPrev !== null)
            newPrev._nextSibling = this;
    }

    //Private methods
    private DropAllChildren()
    {
        if(this._children === undefined)
            return;
        for (let index = 0; index < this._children.length; index++)
        {
            const child = this._children[index];
            child.Unmount();
        }
        this._children = undefined;
    }

    private EnsureRealized()
    {
        if( !this.realized )
        {
            this.RealizeSelf();
            this.realized = true;
        }
        if( this.domNode !== null )
            this.MountChildren({ mountPointNode: this.domNode, reference: "appendChild" });
    }

    private FindMountPoint(checkChildren: boolean = true) : MountPoint | null
    {
        //check this
        if( this.mounted && (this.domNode !== null) )
        {
            if(this.domNode.parentNode === null)
                throw new Error("CAN'T BE");
            return { mountPointNode: this.domNode.parentNode, referenceNode: this.domNode, reference: "before" };
        }

        //check children
        if(checkChildren && this.mounted && (this._children !== undefined) && (this._children.length > 0))
        {
            const result = this._children[0].FindMountPoint();
            if(result !== null)
                return result;
        }

        //check next sibling
        if(this._nextSibling !== null)
        {
            const result = this._nextSibling.FindMountPoint();
            if(result !== null)
                return result;
        }

        //try parent
        if(this.parent !== null)
        {
            if(this.parent.domNode !== null)
                return { mountPointNode: this.parent.domNode, reference: "appendChild" };

            return this.parent.FindMountPoint(false);
        }

        return null;
    }

    private InsertChildBefore(referenceChild: VirtualNode, newChild: VirtualNode)
    {
        if(this._children === undefined)
            this._children = [];

        const refIndex = this._children.indexOf(referenceChild);

        newChild.previousSibling = (refIndex == 0) ? null : this._children[refIndex];
        newChild.nextSibling = referenceChild;

        newChild.parent = this;
        this._children.splice(refIndex, 0, newChild);

        if(this.mounted)
        {
            const mountPoint = newChild.FindMountPoint();
            if(mountPoint === null)
            {
                throw new Error("HERE");
            }
            newChild.Mount(mountPoint);
        }
    }

    private MountChildren(mountPoint: MountPoint)
    {
        if( (this._children !== undefined) )
        {
            const children = this._children;
            for (let index = 0; index < children.length; index++)
            {
                const child = children[index];
                child.Mount(mountPoint);
            }
        }
    }

    private Replace(newVNode: VirtualNode)
    {
        if(this.parent === null)
            throw new Error("HERE");

        this.parent.ReplaceChild(this, newVNode);
    }

    private ReplaceChild(oldChild: VirtualNode, newChild: VirtualNode)
    {
        const next = oldChild._nextSibling;
        this.RemoveChild(oldChild);

        if(next === null)
            this.AddChild(newChild);
        else
            this.InsertChildBefore(next, newChild);
    }
}