/**
 * ACFrontEnd
 * Copyright (C) 2024 Amir Czwink (amir130@hotmail.de)
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

import { Dictionary, EqualsAny } from "acts-util-core";
import { VirtualNode } from "./VirtualNode";
import { TransformRenderValueToVirtualNode } from "./VirtualTreeCreator";
import { SetRendererHook } from "../Hooks";
import { CreateDataBindingProxy, CreateLinkedState, DataLink, FunctionState } from "../DataBinding";

type RenderFunction<InputType> = (input: InputType) => RenderValue;

interface Effect
{
    effect: Function;
    lastDependencies: any;
    callNextTime: boolean;
}

export class VirtualFunction<InputType extends Dictionary<any> | null> extends VirtualNode
{
    constructor(private func: RenderFunction<InputType>, private input: InputType, private subChildren: RenderValue[])
    {
        super();

        this.effects = [];
        this.boundLinks = new Set();
    }

    //Public methods
    public BindToLink(dataLink: DataLink<any>)
    {
        if(!this.boundLinks.has(dataLink))
        {
            dataLink.Bind(this.CallFunction.bind(this));
            this.boundLinks.add(dataLink);
        }
    }

    public GetOrSetState<T extends object>(initialValue: T)
    {
        if(this.state === undefined)
        {
            const proxy = CreateDataBindingProxy(initialValue as any, this.CallFunction.bind(this));
            proxy.links = CreateLinkedState(proxy);
            this.state = proxy;
        }
        return this.state as FunctionState<T>;
    }

    public SetEffects(effects: { effect: Function, dependencies?: any }[])
    {
        for(let i = 0; i < effects.length; i++)
        {
            const src = effects[i];
            const stored = this.effects[i];
            
            if(stored === undefined)
                this.effects.push({ effect: src.effect, lastDependencies: src.dependencies, callNextTime: true });
            else
            {
                stored.effect = src.effect;
                stored.callNextTime = !EqualsAny(stored.lastDependencies, src.dependencies);
                stored.lastDependencies = src.dependencies;
            }
        }

        while(this.effects.length > effects.length)
            this.effects.pop();
    }

    //Protected methods    
    protected override CloneSelf(): VirtualNode
    {
        throw new Error("Method not implemented.");
    }

    protected override RealizeSelf(): Node | null
    {
        this.CallFunction();
        return null;
    }

    protected override UpdateSelf(newNode: VirtualNode | null): VirtualNode | null
    {
        if(newNode instanceof VirtualFunction)
        {
            if((this.func === newNode.func) && EqualsAny(this.input, newNode.input) && EqualsAny(this.subChildren, newNode.subChildren))
                return this;

            if(this.func !== newNode.func)
            {
                this.effects = [];
                this.state = undefined;
                this.boundLinks = new Set();
            }

            this.func = newNode.func;
            this.input = newNode.input;
            this.subChildren = newNode.subChildren;
            this.CallFunction();

            return this;
        }
        return newNode;
    }

    //Private methods
    private CallEffects()
    {
        this.effects.forEach(effect => {
            if(effect.callNextTime)
            {
                effect.effect();
                effect.callNextTime = false;
            }
        });
    }

    private CallFunction()
    {
        SetRendererHook(this);
        const result = this.func({
            ...this.input,
            children: this.subChildren
        });
        SetRendererHook(null);

        const oldChild = (this.children === undefined) ? null : this.children[0];
        const newChild = TransformRenderValueToVirtualNode(result);

        if(oldChild === null)
        {
            if(newChild === null)
                this.children = [];
            else
                this.children = [newChild];
        }
        else if(newChild === null)
        {
            oldChild?.Destroy();
            this.children = [];
        }
        else
        {
            const updatedChild = oldChild.Update(newChild);
            if(updatedChild === oldChild)
                newChild.Destroy();
            else
                oldChild.Destroy();                
        }

        this.CallEffects();
    }

    //State
    private effects: Effect[];
    private state: any;
    private boundLinks: Set<DataLink<any>>;
}