/**
 * ACFrontEnd
 * Copyright (C) 2019-2024 Amir Czwink (amir130@hotmail.de)
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
import { MountPoint, DOM } from "../DOM";

export enum LifecycleState
{
    Created,
    Realized,
    Mounted,
    Unmounted,
    Destroyed,
}

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
            this._lifecycleState = LifecycleState.Created;
        }
        else
        {
            this._domNode = domNode;
            this._lifecycleState = LifecycleState.Mounted;
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
        if(this.mounted)
            throw new Error("Can't destroy virtual node that is still in the dom");
        if( (this._nextSibling !== null) || (this._prevSibling !== null) || (this._parent !== null) )
            throw new Error("Can't destroy virtual node that is still mounted in a virtual tree");

        this._lifecycleState = LifecycleState.Destroyed;
        this._domNode = null;

        if(this._children === undefined)
            return;

        for (const child of this._children)
        {
            this.DropChild(child);
            child.Destroy();
        }
        this._children = undefined;
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

    private Mount(mountPoint: MountPoint): void
    {
        this.EnsureRealized();
        if(this._domNode !== null)
        {
            this.MountChildren({ mountPointNode: this._domNode, reference: "appendChild" });
            DOM.Mount(this._domNode, mountPoint);
        }
        else
            this.MountChildren(mountPoint);
        this._lifecycleState = LifecycleState.Mounted;
        this.OnMounted();
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

    public Update(newVNode: VirtualNode | null): VirtualNode | null
    {
        const updatedNode = this.UpdateSelf(newVNode);
        if(updatedNode !== this)
        {
            if(newVNode === null)
                this.Remove();
            else
                this.Replace(newVNode);
        }

        return updatedNode;
    }

    //Protected members
    protected _injector?: Injector;

    //Protected properties
    protected get lifecycleState()
    {
        return this._lifecycleState;
    }

    //Protected abstract
    protected abstract CloneSelf(): VirtualNode;
    protected abstract RealizeSelf(): Node | null;
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
                newNode.RemoveChildByIndex(0);
            else
                oldChild.Destroy();

            index++;
        }

        //remove additional nodes
        while(index < this.children!.length)
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
     * Null means for a realized node that no dom node representation is available for this node.
     * Currently this is only true for VirtualInstance and VirtualFragment.
     * If this has not been realized, dom node is always null.
     */
    private _domNode: Node | null;
    /**
     * Undefined if the node does not have children.
     * This is currently only true for VirtualTextNode
     */
    private _children?: Array<VirtualNode>;
    private _parent: VirtualNode | null;
    private _nextSibling: VirtualNode | null;
    private _prevSibling: VirtualNode | null;
    private _lifecycleState: LifecycleState;

    //Private properties
    private get mounted()
    {
        return this._lifecycleState === LifecycleState.Mounted;
    }

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
        if(child.mounted)
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
        if(this._lifecycleState === LifecycleState.Created)
        {
            this._domNode = this.RealizeSelf();
            this._lifecycleState = LifecycleState.Realized;
        }
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
        if(refIndex === -1)
            throw new Error("reference node is not a child");
            
        newChild.previousSibling = referenceChild._prevSibling;
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

    private MountAsChildOf(mountPoint: Node)
    {
        this.Mount({ mountPointNode: mountPoint, reference: "appendChild" });
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

    private Remove()
    {
        if(this._parent !== null)
            this._parent.RemoveChild(this);
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
        {
            if(newVNode._parent === null)
                return; //okay, in memory update without being present in the dom
            throw new Error("HERE");
        }
        if(newVNode._parent !== null)
            newVNode._parent.RemoveChild(newVNode);

        this._parent.ReplaceChild(this, newVNode);
    }

    private ReplaceChild(oldChild: VirtualNode, newChild: VirtualNode)
    {
        const next = oldChild._nextSibling;

        if(next === null)
            this.AddChild(newChild);
        else
            this.InsertChildBefore(next, newChild);
        this.RemoveChild(oldChild);
    }

    private Unmount()
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
        this._lifecycleState = LifecycleState.Unmounted;
        this.OnUnmounted();
    }
}
