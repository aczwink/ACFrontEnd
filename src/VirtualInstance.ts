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
import { Instantiatable, Injector } from "acts-util-core";

import { Component } from "./Component";
import { VirtualNode } from "./VirtualNode";
import { ComponentManager } from "./ComponentManager";
import { EqualsAny } from "./JSTypes";

interface Dictionary
{
    [key: string]: any;
}

export class VirtualInstance extends VirtualNode
{
    constructor(type: Instantiatable<Component>, args: Dictionary | null, subChildren?: VirtualNode[])
    {
        super();

        this.type = type;
        this.args = args;
        this._subChildren = subChildren;
        this.instance = null;
        this.injections = undefined;
    }

    //Properties
    public get input()
    {
        return this.args;
    }

    //Protected methods
    protected RealizeSelf(): void
    {
        const ownInjector = new Injector;
        ownInjector.parent = this.injector;
        this.injector = ownInjector;
        ownInjector.RegisterInstance(Injector, ownInjector);

        this.injections = this.injector.ResolveInjections(this.type);
        this.instance = ComponentManager.CreateComponent(this.type, this.injector);

        //set children
        this.PassInputArgs(this.args);

        this.instance.OnInitiated();

        if((this.instance === null) || (this.instance.vNode === null) )
            this.children = undefined;
        else
            this.children = [this.instance.vNode];
    }

    protected UpdateSelf(newNode: VirtualNode | null): VirtualNode | null
    {
        if(newNode instanceof VirtualInstance)
        {
            if(this.type === newNode.type)
            {
                if(this.instance !== null)
                {
                    //try to not change instance to not loose state
                    const requiresNewInstance = this.InjectionsChanged();

                    if(!requiresNewInstance)
                    {
                        let issueUpdate = false;
                        //check if input args changed
                        if(!EqualsAny(this.args, newNode.args))
                        {
                            this.PassInputArgs(newNode.args);
                            this.instance.OnInputChanged();
                        }

                        //check if sub children changed
                        if(!EqualsAny(this._subChildren, newNode._subChildren))
                        {
                            issueUpdate = true;
                        }

                        this.args = newNode.args;
                        this._subChildren = newNode._subChildren;
                        const input = (this.instance as any).input;
                        input.children = this._subChildren;
                        if(issueUpdate)
                            this.instance.Update();
                        return this;
                    }
                }
            }
        }

        return newNode;
        /*
        if(this.instance !== null)
            newNode.ReplaceNodeWithSelf(this.domNode);
		*/
    }

    //Event handlers
    protected OnUnmounted()
    {
        if(this.instance !== null)
            this.instance.OnUnmounted();
    }

    //Private methods
    private InjectionsChanged(): boolean
    {
        if(this.instance !== null)
        {
            const newInjections = this.injector.ResolveInjections(this.type);
            return !EqualsAny(this.injections, newInjections);
        }

        return false;
    }

    private PassInputArgs(args: Dictionary | null)
    {
        if(args !== null)
        {
            const input = (this.instance as any).input;
            for (const key in args)
            {
                input[key] = args[key]
            }
            input.children = this._subChildren;
        }
        else
        {
            (this.instance as any).input = {
                children: this._subChildren
            };
        }
    }
    
    //Private members
    private type: Instantiatable<Component>;
    private args: Dictionary | null;
    private _subChildren?: Array<VirtualNode>;
    private instance: Component | null;
    private injections: any;
}