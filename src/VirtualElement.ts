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
import { VirtualNode } from "./VirtualNode";

export class VirtualElement extends VirtualNode
{
    constructor(tagName: string, properties: any, children?: VirtualNode[])
    {
        super();
        this._tagName = tagName;
        this._properties = properties;

        if(children !== undefined)
            this.children = children;
    }

    //Properties
    public get properties()
    {
        return this._properties;
    }

    public set properties(newProperties: any)
    {
        this._properties = newProperties;
    }

    public get tagName()
    {
        return this._tagName;
    }

    //Protected methods
    protected RealizeSelf(): void
    {
        const element = document.createElement(this._tagName);
            
        for(var key in this._properties)
            (element as any)[key] = this._properties[key];

        this._domNode = element;
    }

    protected UpdateSelf(newNode: VirtualNode | null): VirtualNode | null
    {
        if(newNode instanceof VirtualElement)
        {
            if(this._tagName == newNode._tagName)
            {
                //update self
                if(this._domNode !== null)
                    this.UpdateObject(this._domNode, this._properties, newNode._properties);
                this._properties = newNode._properties;
                if(this._domNode !== null)
                    this.SyncInputProperties();
                
                this.UpdateChildren(newNode);
                return this;
            }
        }

        return newNode;
        /*
        if(this._domNode)
            DOM.ReplaceNode(this._domNode, newNode.domNode);
		*/
    }

    //Private members
    private _tagName: string;
    private _properties: any;

    //Private methods
    /**
     * Input DOM-Nodes maintain state themselves based on user-input.
     * This state gets updated when the user interacts with the element and usually change events are used, to update Component's state.
     * However, in a "non-fully-controlled"-component, this state may get out of sync with the DOM-Node.
     * 
     * This method syncs the properties of this node to the DOM-Node, such that they are equal at least on every update.
     */
    private SyncInputProperties()
    {
        if(this._tagName !== "input")
            return;

        const inputNode = this._domNode as HTMLInputElement;
        switch(inputNode.type)
        {
            case "checkbox":
                inputNode.checked = "checked" in this._properties;
                break;
        }
    }

    private UpdateObject(object: any, oldProps: any, newProps: any)
	{
		var propsToSet: any[] = [];
        var propsToUnset: any[] = [];

        if( (oldProps === null) && (newProps !== null) )
        {
            propsToSet = Object.keys(newProps);
        }
        if( (oldProps !== null) && (newProps === null) )
        {
            propsToUnset = Object.keys(oldProps);
        }
        else if( (oldProps !== null) && (newProps !== null) )
        {
            for(var prop in newProps)
            {
                if((prop in oldProps) && (oldProps[prop] === newProps[prop]))
                    continue;
                propsToSet.push(prop);
            }
            for(var prop in oldProps)
            {
                if(!(prop in newProps))
                    propsToUnset.push(prop);
            }
        }
		propsToSet.forEach( prop => object[prop] = newProps[prop] );
		propsToUnset.forEach( prop => object[prop] = null );
    }
}