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

import { Dictionary, EqualsAny, ObjectExtensions } from "@aczwink/acts-util-core";
import { LifecycleState, VirtualNode } from "./VirtualNode";
import { TransformRenderValueToVirtualNode } from "./VirtualTreeCreator";
import { SetRendererHook } from "../Hooks";
import { CreateDataBindingProxy, CreateLinkedState, DataLink, FunctionState } from "../DataBinding";
import { RouterState } from "../Services/Router/RouterState";

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

        this.effects = {};
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
        if(this.rawState === undefined)
            this.rawState = {};

        let changed = false;
        for (const key in initialValue)
        {
            if (Object.prototype.hasOwnProperty.call(initialValue, key))
            {
                const value = initialValue[key];
                if(key in this.rawState)
                    continue;

                this.rawState[key] = value;
                changed = true;
            }
        }
        if(changed)
        {
            const proxy = CreateDataBindingProxy(this.rawState, this.CallFunction.bind(this));
            proxy.links = CreateLinkedState(proxy);
            this.state = proxy;
        }
        return this.state as FunctionState<T>;
    }

    public ResolveInjection<T>(token: Instantiatable<T>)
    {
        const injected = this.injector!.Resolve(token);
        if(token as any === RouterState)
            this.routerState = injected as any;
        return injected;
    }

    public SetEffect(id: string, effect: Function, dependencies: any)
    {
        const stored = this.effects[id];

        if(stored === undefined)
            this.effects[id] = { effect, callNextTime: true, lastDependencies: dependencies };
        else
        {
            stored.effect = effect;
            stored.callNextTime ||= !EqualsAny(stored.lastDependencies, dependencies);
            stored.lastDependencies = dependencies;
        }
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
            {
                if(this.DidEnvironmentChange())
                {
                    this.ResetState();
                    this.CallFunction();
                }
                return this;
            }

            if(this.func !== newNode.func)
            {
                this.ResetState();
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
        ObjectExtensions.Values(this.effects).NotUndefined().ForEach(effect => {
            if(effect.callNextTime)
            {
                effect.callNextTime = false;
                effect.effect();
            }
        });
    }

    private CallFunction()
    {
        if((this.lifecycleState === LifecycleState.Unmounted) || (this.lifecycleState === LifecycleState.Destroyed))
            return;

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

    private DidEnvironmentChange()
    {
        if(this.routerState !== undefined)
        {
            const oldState = this.routerState;
            const newState = this.ResolveInjection(RouterState);

            const isEqual = EqualsAny(oldState.queryParams, newState.queryParams) && EqualsAny(oldState.routeParams, newState.routeParams)
            return !isEqual;
        }
        return false;
    }

    private ResetState()
    {
        this.effects = {};
        this.state = undefined;
        this.rawState = undefined;
    }

    //State
    private effects: Dictionary<Effect>;
    private state: FunctionState<any>;
    private rawState: any;
    private boundLinks: Set<DataLink<any>>;
    private routerState?: RouterState;
}