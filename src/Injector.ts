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
import "reflect-metadata";
import { Component } from "./Component";

export interface Instantiatable<T>
{
    new(...args: any[]): T;
}

let injectables = new Map<Function, any>();
export function Injectable<T extends Instantiatable<{}>>(constructor:T)
{
    injectables.set(constructor, null);
    return constructor;
    /*return class extends constructor
    {
        constructor(...args:any[])
        {
            super(...args);
        }
    };*/
}

export const Injector = new class
{
    //Public methods
    public CreateComponent<T>(componentType: Instantiatable<Component>): Component
    {
        const instance = this.CreateInstance(componentType); //components are always instantiated
        const instanceAny = instance as any;

        //set input
        instanceAny.input = {};

        this.InstallDataBindings(instance, instanceAny);
        
        return instance;
    }

    public Register<T>(type: Instantiatable<T>, instance: T)
    {
        injectables.set(type, instance);
    }

    public Resolve<T>(target: Instantiatable<T>): T
    {
        let instance = injectables.get(target);
        if(instance === undefined)
        {
            throw new Error("Unknown injectable: " + target);
        }
        if(instance === null)
        {
            const newInstance = this.CreateInstance(target);
            this.Register(target, newInstance);
            instance = newInstance;
        }
        return instance as unknown as T;
    }

    public ResolveInjections<T>(target: Instantiatable<T>): any
    {
        const argsTypes = Reflect.getMetadata('design:paramtypes', target) || [];
        const injections = argsTypes.map((argType : any) => this.Resolve(argType));
        return injections;
    }

    //Private methods
    //TODO: why can't these be private?
    public CreateInstance<T>(target: Instantiatable<T>): T
    {
        return new target(...this.ResolveInjections(target));
    }

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
        for (let i = 0; i < propertyKeys.length; i++)
        {
            const key = propertyKeys[i] as string;

            //skip special symbols
            if(key === "_vNode")
                continue;
            if(key === "input")
                continue;

            this.InstallDataBinding(instance, instanceAny, key);
        }
    }
}