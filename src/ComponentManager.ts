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
import { Component } from "./Component";
import { Dictionary, Instantiatable, Injector } from "acts-util-core";
import { RootInjector } from "./App";

export function Injectable<T extends Instantiatable<{}>>(constructor:T)
{
    RootInjector.RegisterProvider(constructor, constructor);
    return constructor;
}

interface MemberMetadata
{
    installDataBinding: boolean;
}

export function DontBind(target: any, key: string)
{
    if(target.__members === undefined)
        target.__members = {};
    const members: Dictionary<MemberMetadata> = target.__members;

    members[key] = { installDataBinding: false };
}

export const ComponentManager = new class
{
    //Public methods
    public CreateComponent<T>(componentType: Instantiatable<Component>, injector: Injector): Component
    {
        const instance = injector.CreateInstance(componentType); //components are always instantiated
        const instanceAny = instance as any;

        //set input
        instanceAny.input = {};

        this.InstallDataBindings(instance, instanceAny);
        
        return instance;
    }

    //Private methods
    //TODO: why can't these be private?
    public InstallDataBinding(instance: Component, instanceAny: any, propertyName: string)
    {
        let value: any = instanceAny[propertyName];
        delete instanceAny[propertyName];

        Object.defineProperty(instanceAny, propertyName, {			
			get: () =>
			{
				return value;
			},
			
			set: (newValue) =>
			{
				const oldValue = value;
                value = newValue;
                if(oldValue !== newValue)
                    instance.Update();
			}
		});
    }

    public InstallDataBindings(instance: Component, instanceAny: any)
    {
        const propertyKeys = Reflect.ownKeys(instanceAny);
        const members: Dictionary<MemberMetadata>|undefined = (instance as any).__members;
        for (let i = 0; i < propertyKeys.length; i++)
        {
            const key = propertyKeys[i] as string;

            //skip special symbols
            if(key === "_vNode")
                continue;
            if(key === "input")
                continue;
            if( (members !== undefined) && (key in members) && (members[key]!.installDataBinding === false) )
                continue;

            this.InstallDataBinding(instance, instanceAny, key);
        }
    }
}