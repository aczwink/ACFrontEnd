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

export abstract class VirtualNode
{
    constructor(domNode?: Node)
    {
        this._nextSibling = null;
        this._parent = null;
        this._prevSibling = null;

        if(domNode === undefined)
        {
            this._domNode = null;
            this.mounted = false;
            this.realized = false;
        }
        else
        {
            this._domNode = domNode;
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

    public get domNode()
    {
        return this._domNode;
    }

    public get injector(): Injector | undefined
    {
        if(this._injector === undefined)
        {
            if(this._parent === null)
                return undefined;
            return this._parent.injector;
        }
        return this._injector;
    }

    //Public methods
    public AddChild(newChild: VirtualNode)
    {
        if(newChild._parent !== null)
            throw new Error("Can't add child that already has a parent");

        if(this._children === undefined)
            this._children = [];

        if(this._children.length > 0)
            newChild.previousSibling = this._children[this._children.length - 1];
        else
            newChild.previousSibling = null;
        newChild.nextSibling = null;

        newChild._parent = this;
        this._children.push(newChild);

        if(this.mounted)
        {
            const mountPoint = newChild.FindMountPoint();
            if(mountPoint === null)
                throw new Error("TODO");
            newChild.Mount(mountPoint);
        }
    }

    public Clone()
    {
        const clone = this.CloneSelf();
        if(this.children !== undefined)
            clone.children = this.children.map(child => child.Clone());
        return clone;
    }

    public Destroy()
    {
        if(this._domNode !== null)
            throw new Error("Can't destroy virtual node that is still in the dom");
        if( (this._nextSibling !== null) || (this._prevSibling !== null) || (this._parent !== null) )
            throw new Error("Can't destroy virtual node that is still mounted in a virtual tree");

        this.DropAllChildren();
    }

    public EnsureHasOwnInjector()
    {
        this._injector = new Injector;
        this._injector.parent = () => {
            if(this._parent === null)
                return null;
            const parentInjector = this._parent.injector
            if(parentInjector === undefined)
                return null;
            return parentInjector;
        };
    }

    public Mount(mountPoint: MountPoint): void
    {
        this.EnsureRealized();
        if(this._domNode !== null)
            DOM.Mount(this._domNode, mountPoint);
        else
            this.MountChildren(mountPoint);
        this.mounted = true;
        this.OnMounted();
    }

    public MountAsChildOf(mountPoint: Node)
    {
        this.Mount({ mountPointNode: mountPoint, reference: "appendChild" });
    }

    public RemoveChild(child: VirtualNode)
    {
        if(this._children === undefined)
            throw new Error("HERE");
        const index = this._children.indexOf(child);
        if(index === -1)
            throw new Error("Can't remove child if it isn't a child");
        this.RemoveChildByIndex(index);
    }

    public Unmount()
    {
        if(this._domNode !== null)
        {
            DOM.Unmount(this._domNode);
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
    protected _domNode: Node | null;
    protected _injector?: Injector;

    //Protected abstract
    protected abstract CloneSelf(): VirtualNode;
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

        //update nodes
        const newChildren = newNode._children;

        //update nodes
        let index = 0;
        while( (newChildren.length > 0) && (index < this.children!.length) )
        {
            const oldChild = this._children[index];
            const newChild = newChildren[0];
            const updatedNode = oldChild.Update(newChild)!;

            if(updatedNode === oldChild)
            {
                newNode.RemoveChildByIndex(0);
                index++;
            }
            else
                oldChild.Destroy();
        }

        //remove additional nodes
		for(; index < this.children!.length; index++)
		{
            this.RemoveChildByIndex(this.children!.length - 1);
        }

        //add new additional nodes
        while(newChildren.length > 0)
        {
            const newChild = newChildren[0];
            newNode.RemoveChildByIndex(0);

            this.AddChild(newChild);
        }
    }

    //Event handlers
    protected OnMounted()
    {
    }
    
    protected OnUnmounted()
    {
    }

    //Private members
    /**
     * Undefined if the node does not have children.
     * This is currently only true for VirtualTextNode
     */
    private _children?: Array<VirtualNode>;
    private _parent: VirtualNode | null;
    private _nextSibling: VirtualNode | null;
    private _prevSibling: VirtualNode | null;
    private mounted: boolean;
    private realized: boolean;

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
    private DropChild(child: VirtualNode)
    {
        if(child._prevSibling === null)
        {
            if(child._nextSibling !== null)
                child._nextSibling.previousSibling = null;
        }
        else
            child._prevSibling.nextSibling = child._nextSibling;

        child._parent = null;
        child._prevSibling = null;
        child._nextSibling = null;
        child.Unmount();
    }

    private DropAllChildren()
    {
        if(this._children === undefined)
            return;
        for (let index = 0; index < this._children.length; index++)
        {
            const child = this._children[index];
            this.DropChild(child);
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
        if( this._domNode !== null )
            this.MountChildren({ mountPointNode: this._domNode, reference: "appendChild" });
    }

    private FindMountPoint(checkChildren: boolean = true) : MountPoint | null
    {
        //check this
        if( this.mounted && (this._domNode !== null) )
        {
            if(this._domNode.parentNode === null)
                throw new Error("CAN'T BE");
            return { mountPointNode: this._domNode.parentNode, referenceNode: this._domNode, reference: "before" };
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
        if(this._parent !== null)
        {
            if(this._parent._domNode !== null)
                return { mountPointNode: this._parent._domNode, reference: "appendChild" };

            return this._parent.FindMountPoint(false);
        }

        return null;
    }

    private InsertChildBefore(referenceChild: VirtualNode, newChild: VirtualNode)
    {
        if(newChild._parent !== null)
            throw new Error("Can't add child that already has a parent");
            
        if(this._children === undefined)
            this._children = [];

        const refIndex = this._children.indexOf(referenceChild);

        newChild.previousSibling = (refIndex == 0) ? null : this._children[refIndex];
        newChild.nextSibling = referenceChild;

        newChild._parent = this;
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

    private RemoveChildByIndex(index: number)
    {
        const child = this._children![index];
        this._children!.Remove(index);
        this.DropChild(child);
    }

    private Replace(newVNode: VirtualNode)
    {
        if(this._parent === null)
            throw new Error("HERE");
        if(newVNode._parent !== null)
            newVNode._parent.RemoveChild(newVNode);

        this._parent.ReplaceChild(this, newVNode);
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