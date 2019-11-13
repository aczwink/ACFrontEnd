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

function MoveProperty(properties: any, fromKey: string, toKey: string)
{
    if(fromKey in properties)
    {
        properties[toKey] = properties[fromKey];
        delete properties[fromKey];
    }
}

function RedirectProperties(properties: any)
{
    if(properties !== null)
    {
        MoveProperty(properties, "class", "className");
    }
    return properties;
}

export class VirtualElement extends VirtualNode
{
    constructor(tagName: string, properties: any)
    {
        super();
        this.tagName = tagName;
        this.properties = RedirectProperties(properties);
    }

    //Protected methods
    protected RealizeSelf(): void
    {
        const element = document.createElement(this.tagName);
            
        for(var key in this.properties)
            (element as any)[key] = this.properties[key];

        this.domNode = element;
    }

    protected UpdateSelf(newNode: VirtualNode | null): VirtualNode | null
    {
        if(newNode instanceof VirtualElement)
        {
            if(this.tagName == newNode.tagName)
            {
                //update self
                if(this.domNode !== null)
                    this.UpdateObject(this.domNode, this.properties, newNode.properties);
                this.properties = newNode.properties;
                
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
    private tagName: string;
    private properties: any;

    //Private methods
    private UpdateObject(object: any, oldProps: any, newProps: any)
	{
		var propsToSet = [];
		var propsToUnset = [];
		
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
		propsToSet.forEach( prop => object[prop] = newProps[prop] );
		propsToUnset.forEach( prop => object[prop] = null );
    }
}