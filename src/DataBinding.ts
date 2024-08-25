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

import { Component } from "./Component";

export interface DataLink<T>
{
    readonly value: T;
    Bind(func: Function): void;
    BindComponent(component: Component): void;
    Set: (newValue: T) => void;
    UnbindComponent(component: Component): void;
}

export function CreateDataBindingHook(object: any, propertyName: string | number | symbol, onPropertyChanged: Function)
{
    const instanceAny = object as any;
        
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
                onPropertyChanged();
        }
    });
}

export function CreateDataBindingProxy<T extends object>(sourceObject: T, onPropertyChanged: Function): T
{
    const result = {};

    const keys = Reflect.ownKeys(sourceObject);
    const src = sourceObject as any;
    for (const key of keys)
    {
        Object.defineProperty(result, key, {
            get: () => src[key],
            set: (newValue) => {
                if(src[key] !== newValue)
                {
                    src[key] = newValue;
                    onPropertyChanged();
                }
            },
            enumerable: true,
        });
    }

    return result as T;
}

export function CreateDataLink<T>(object: T, propertyName: keyof T): DataLink<T[keyof T]>
{
    const components: Component<any, any>[] = [];
    const functions: Function[] = [];

    const result: DataLink<T[keyof T]> = {
        value: object[propertyName],
        Bind(func: Function)
        {
            functions.push(func);
        },
        BindComponent(component: Component)
        {
            components.push(component);
        },
        Set: newValue => {
            if(object[propertyName] !== newValue)
            {
                object[propertyName] = newValue;
                functions.forEach( func => func() );
                components.forEach( component => component.Update() );
            }
        },
        UnbindComponent(component: Component)
        {
            components.Remove(components.indexOf(component));
        },
    };

    //make sure that the link is always up to date
    Object.defineProperty(result, "value", {
        get: () => object[propertyName],
    })

    return result;
}

export type LinkedState<T> = {
    [key in keyof T]: DataLink<T[key]>;
};
export function CreateLinkedState<T extends object>(sourceObject: T)
{
    const result: any = {};
    const keys = Reflect.ownKeys(sourceObject);
    for (const key of keys)
    {
        result[key] = CreateDataLink(sourceObject, key as any);
    }

    return result as LinkedState<T>
}

export type FunctionState<T> = T & { links: LinkedState<T> };