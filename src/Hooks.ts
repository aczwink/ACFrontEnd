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

import { RootInjector } from "./App";
import { VirtualFunction } from "./VirtualTree/VirtualFunction";
import { DataLink, RouterState } from "./main";

let currentRenderFunction: VirtualFunction<any> | null = null;

export function SetRendererHook(func: VirtualFunction<any> | null)
{
    currentRenderFunction = func;
}

export function Use<T>(token: Instantiatable<T>)
{
    const injector = currentRenderFunction?.injector ?? RootInjector;
    return injector.Resolve(token)!;
}

export function UseEffects(effects: { effect: Function, dependencies?: any }[])
{
    currentRenderFunction?.SetEffects(effects);
}

export function UseEffectOnce(effect: Function)
{
    UseEffects([
        { effect, dependencies: null}
    ]);
}

export function UseState<T extends object>(initialValue: T)
{
    return currentRenderFunction!.GetOrSetState(initialValue);
}

//Advanced
export function UseDataLink(dataLink: DataLink<any>)
{
    currentRenderFunction!.BindToLink(dataLink);
}

export function UseRouteParameter(source: "route", name: string): string;
export function UseRouteParameter(source: "route", name: string, format: "unsigned"): number;
export function UseRouteParameter(source: "route", name: string, format?: "unsigned")
{
    if(format === undefined)
        return Use(RouterState).ExtractParameter(source, name);
    return Use(RouterState).ExtractParameter(source, name, format);
}