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
import { Component } from "./Component";
import { VirtualNode } from "./VirtualNode";
import { Instantiatable, Injector } from "./Injector";
import { DOM } from "./DOM";

export class VirtualInstance implements VirtualNode
{
    constructor(type: Instantiatable<Component>, args: any, children: VirtualNode[])
    {
        this.type = type;
        this.args = args;
        this.children = children;
        this.instance = null;
    }

    //Properties
    get domNode(): Node
    {
        if(this.instance === null)
        {
            this.instance = Injector.CreateComponent(this.type); //...this.__args

            //set children
            const input = (this.instance as any).input;
            /*if(this.children.length == 1)
                input.children = this.children[0];
            else*/
                input.children = this.children;

            //set input
            if(this.args !== null)
            {
                Object.keys(this.args).forEach(key => input[key] = this.args[key]);
            }
        }
		return this.instance.domNode;
    }

    //Public methods
    public Update(newNode: VirtualNode): VirtualNode
    {
        if(newNode instanceof VirtualInstance)
        {
            if(this.type === newNode.type)
            {
                //try to not change instance to not loose state
                if(!this.InjectionChangeCausesNewComponent())
                {
                    //check if input args changed
                    if( (this.instance !== null) && (!this.ArgsAreEqual(this.args, newNode.args)) )
                    {
                        throw new Error("Method-block not implemented.");
                        //TODO: old code
                        //this.instance.__OnNewProperties(...newNode.__args);
                        //this.__instance.Update();
                    }
                    this.args = newNode.args;
                    
                    return this;
                }
            }
        }

        if(this.instance !== null)
            DOM.ReplaceNode(this.domNode, newNode.domNode);
		return newNode;
    }

    //Private members
    private type: Instantiatable<Component>;
    private args: any;
    private children: Array<VirtualNode>;
    private instance: Component | null;

    //Private methods
    private InjectionChangeCausesNewComponent(): boolean
    {
        if(this.instance !== null)
        {
            throw new Error("Method-block not implemented.");
        }

        return false;
    }

    private ArgsAreEqual(args1: any, args2: any)
	{
		if(args1.length != args2.length)
			return false;
		for(var i = 0; i < args1.length; i++)
		{
			if(args1[i] != args2[i])
				return false;
		}
		return true;
	}
}