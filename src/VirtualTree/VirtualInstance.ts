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
import { Instantiatable, Injector, EqualsAny, Dictionary } from "@aczwink/acts-util-core";
import { VirtualNode } from "./VirtualNode";
import { Component } from "../Component";
import { ClassComponentMemberMetadata } from "../decorators";
import { ClassComponentConstructorMetadata, GetConstructorMetadata } from "../metadata";
import { RouterState } from "../Services/Router/RouterState";
import { CreateDataBindingHook } from "../DataBinding";

export class VirtualInstance<ComponentType extends Component<InputType, ChildrenType>, InputType extends Dictionary<any> | null = Dictionary<any> | null, ChildrenType = undefined> extends VirtualNode
{
    constructor(type: Instantiatable<ComponentType>, args: InputType, subChildren?: ChildrenType)
    {
        super();

        this.type = type;
        this.args = args;
        this._subChildren = subChildren;
        this.instance = null;
        this.injections = undefined;

        this.EnsureHasOwnInjector();
    }

    //Public methods
    public override Destroy(): void
    {
        super.Destroy();
        this.instance = null;
    }

    //Properties
    public get input()
    {
        return this.args;
    }

    //Protected methods
    protected CloneSelf(): VirtualNode
    {
        return new VirtualInstance(this.type, this.args === null ? null : (this.args as any).Clone(), this._subChildren as any);
    }

    protected RealizeSelf(): Node | null
    {
        this.injector!.RegisterInstance(Injector, this.injector);

        this.injections = this.ResolveInjections();
        this.instance = this.CreateComponentInstance();

        this.PassInputArgs(this.args);
        this.PassChildren();

        this.instance!.OnInitiated();

        if((this.instance === null) || (this.instance.vNode === null) )
            this.children = undefined;
        else
            this.children = [this.instance.vNode];

        return null;
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

                        this.PassChildren();

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
    override OnUnmounted()
    {
        if(this.instance !== null)
            this.instance.OnUnmounted();
    }

    //Private methods
    private CreateComponentInstance()
    {
        const instance = new this.type(...this.ResolveInjections()); //components are always instantiated

        this.InstallDataBindings(instance);
        
        return instance;
    }

    private InjectionsChanged(): boolean
    {
        if(this.instance !== null)
        {
            const newInjections = this.ResolveInjections();
            return !EqualsAny(this.injections, newInjections);
        }

        return false;
    }

    private InstallDataBindings<InputType, ChildrenType>(instance: Component<InputType, ChildrenType>)
    {
        const propertyKeys = Reflect.ownKeys(instance);
        const members: Dictionary<ClassComponentMemberMetadata> | undefined = (instance as any).__members;
        for (let i = 0; i < propertyKeys.length; i++)
        {
            const key = propertyKeys[i] as string;
            if( (members !== undefined) && (key in members) && (members[key]!.installDataBinding === false) )
                continue;
            CreateDataBindingHook(instance, key, instance.Update.bind(instance));
        }
    }

    private PassChildren()
    {
        (this.instance as any)._children = this._subChildren;
    }

    private PassInputArgs(args: Dictionary<any> | null)
    {
        const input: Dictionary<any> = {};
        if(args !== null)
        {
            for (const key in args)
            {
                input[key] = args[key]
            }
        }

        (this.instance as any)._input = input;
    }

    private ResolveInjection(argType: any, metadata?: ClassComponentConstructorMetadata)
    {
        switch(metadata?.type)
        {
            case "route-param":
            {
                const stringValue = this.injector!.Resolve(RouterState).routeParams[metadata.name];
                if(argType === Number)
                    return parseInt(stringValue!);
                return stringValue;
            }
        }
        return this.injector!.Resolve(argType);
    }

    private ResolveInjections()
    {
        const md = GetConstructorMetadata(this.type);
        const argsTypes: any[] = Reflect.getMetadata('design:paramtypes', this.type) || [];
        const injections = argsTypes.map((argType, index) => this.ResolveInjection(argType, md[index]));
        return injections;
    }
    
    //Private members
    private type: Instantiatable<ComponentType>;
    private args: InputType;
    private _subChildren?: ChildrenType;
    private instance: ComponentType | null;
    private injections: any;
}