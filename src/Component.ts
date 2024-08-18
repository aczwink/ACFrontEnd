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

import { CreateDataBindingProxy, CreateDataLink, CreateLinkedState, LinkedState } from "./DataBinding";
import { VirtualConstNode } from "./VirtualTree/VirtualConstNode";
import { VirtualNode } from "./VirtualTree/VirtualNode";
import { TransformRenderValueToVirtualNode } from "./VirtualTree/VirtualTreeCreator";
import { DontBind } from "./decorators";

type GetTypeOfArray<T> = T extends Array<infer U> ? U : T;
type CreateJSXProps<InputType, ChildrenType> = ChildrenType extends undefined ? InputType: (InputType & { children: ChildrenType });
export type State<T> = T & { links: LinkedState<T> };

export abstract class Component<InputType = null | {}, ChildrenType = undefined>
{
    //Constructor
    constructor()
    {
        this._vNode = null;
    }

    //Properties
    public get vNode(): VirtualNode | null
    {
        if( (this._vNode === null) )
            this.UpdateSync();
        return this._vNode;
    }

    //Public methods
    public Update()
    {
        this.UpdateSync.bind(this).CallImmediate();
    }

    public UpdateSync()
    {
        const newRenderValue = this.Render();
        
        const newVNode = TransformRenderValueToVirtualNode(newRenderValue);

        if(this._vNode === null) //special case: component was never used before
        {
            if(newVNode === null) //components can't have a null child, because they can't update themselves without their parent being updated
                this._vNode = new VirtualConstNode();
            else
                this._vNode = newVNode;
        }
        else
        {
            const oldVNode = this._vNode;
            this._vNode = this._vNode.Update(newVNode);

            if(this._vNode !== oldVNode)
                oldVNode.Destroy();
            else if(newVNode !== null)
                newVNode.Destroy();
        }
    }

    //Protected properties
    protected get children(): GetTypeOfArray<ChildrenType>[]
    {
        if(Array.isArray(this._children))
            return this._children;
        return [this._children] as any;
    }

    protected get input(): Readonly<InputType>
    {
        return this._input;
    }

    //Protected abstract
    protected abstract Render(): RenderValue;

    //Protected methods
    protected CreateState<T>(initialValue: T)
    {
        const proxy = CreateDataBindingProxy(initialValue as any, this.Update.bind(this));
        proxy.links = CreateLinkedState(proxy);
        return proxy as State<T>;
    }

    protected CreateStateLink<T>(initialValue: T)
    {
        const dummy = {
            dummy: initialValue
        };
        const link = CreateDataLink(dummy, "dummy");
        link.BindComponent(this as any);
        return link;
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
    @DontBind
    private _vNode: VirtualNode | null;
    private _input!: InputType;
    private _children!: ChildrenType;

    protected __jsxProperties!: CreateJSXProps<InputType, ChildrenType>;
}

interface RenderComponent<ComponentType extends Renderable, InputType extends any, ChildrenType extends RenderValue> extends RenderComponentElement
{
    type: Instantiatable<ComponentType>;
    properties: InputType;
    children: ChildrenType[];
}

export type RenderComponentChild<ComponentType> = ComponentType extends Component<infer InputType, infer ChildrenType>
    ? ChildrenType extends RenderValue
        ? RenderComponent<ComponentType, InputType, ChildrenType>
        : never
    : never;
export type RenderComponentChildWithChildrenHelp<ComponentType, ChildrenType> = ComponentType extends Component<infer InputType, ChildrenType>
    ? ChildrenType extends RenderValue
        ? RenderComponent<ComponentType, InputType, ChildrenType>
        : never
    : never;