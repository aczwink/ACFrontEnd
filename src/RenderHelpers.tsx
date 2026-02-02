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

import { JSX_CreateElement } from "./JSX_CreateElement";
import { GetCounterId, UseEffectOnce, UseState } from "./Hooks";
import { ProgressSpinner } from "./Components/ProgressSpinner";
import { CreateDataLink, DataLink } from "./DataBinding";
import { Component } from "./Component";
import { ObjectExtensions } from "@aczwink/acts-util-core";


export interface APIResponse<DataType>
{
	statusCode: number;
    data?: DataType;
    rawBody: any;
}

export interface DeferredAPIState<T>
{
    state: APICallState<T>;
    fallback: any;
    start: () => void;
}

interface SuccessState<T>
{
    success: true;
    data: T;
    started: true;
}
interface ErrorState
{
    success: false;
    finished: true;
    rawBody: any;
    started: true;
}
interface WaitingState
{
    success: false;
    finished: false;
    started: true;
}
interface NotStartedState
{
    success: false;
    finished: false;
    started: false;
}

export type APICallState<T> = SuccessState<T> | ErrorState | WaitingState | NotStartedState;

export function APIStateHandler<T>(input: { state: APICallState<T> })
{
    const s = input.state;

    if(s.success)
        return "API call succeeded";

    if(s.finished)
    {
        alert("TODO: API error occured");
        console.error(s.rawBody);
        throw new Error("TODO: API error occured");
    }

    if(s.started)
        return <ProgressSpinner />;

    return "API call waiting to be started";
}

export async function CallAPI<T>(call: () => Promise<APIResponse<T>>, link: DataLink<APICallState<T>>, successHandler?: (data: T) => void)
{
    link.Set({ success: false, finished: false, started: true });
    const response = await call();
    if(response.statusCode === 200)
    {
        if(successHandler !== undefined)
            successHandler(response.data!);
        link.Set({ data: response.data!, success: true, started: true });
    }
    else if(response.statusCode === 204)
    {
        if(successHandler !== undefined)
            successHandler(null as any);
        link.Set({ data: response.data!, success: true, started: true });
    }
    else
        link.Set({ success: false, finished: true, rawBody: response.rawBody, started: true });
}

export function CreateDeferredAPIState<T, I, C>(call: () => Promise<APIResponse<T>>, component: Component<I, C>): DeferredAPIState<T>
{
    const state = InitAPIState<T>();
    const result: DeferredAPIState<T> = {
        state,
        start: () => CallAPI(call, stateLink),
        fallback: { type: APIStateHandler, properties: { state }} as any
    };
    const stateLink = CreateDataLink(result, "state");
    stateLink.BindComponent(component as any);
    return result;
}

export function InitAPIState<T>(): APICallState<T>
{
    return { success: false, finished: false, started: false };
}

export function UseAPI<T>(call: () => Promise<APIResponse<T>>, onSuccess?: (data: T) => void)
{
    const id = GetCounterId("api");
    const state = UseState({
        [id]: InitAPIState<T>()
    });
    UseEffectOnce(() => CallAPI(call, state.links[id], onSuccess));

    return {
        ...state[id],
        fallback: <APIStateHandler state={state[id]} />,
    };
}

export function UseDeferredAPI<T>(call: () => Promise<APIResponse<T>>, onSuccess?: (data: T) => void)
{
    const id = GetCounterId("api");
    const state = UseState({
        [id]: InitAPIState<T>()
    });

    return {
        ...state[id],
        fallback: <APIStateHandler state={state[id]} />,
        start: () => CallAPI(call, state.links[id], onSuccess)
    };
}

type APICallFunction<T> = () => Promise<APIResponse<T>>;
type APICall<T> = {
    call: APICallFunction<T>,
    onSuccess?: (data: T) => void
};
type APICallObject<T> = {
    [key in keyof T]: APICall<T[key]>;
};
type MuxedObject<T> = {
    [key in keyof T]: T[key];
};
type APICallArray<T> = () => Promise<APIResponse<T>[]>;
export function UseAPIs<T>(calls: APICallObject<T>): APICallState<MuxedObject<T>> & { fallback: any };
export function UseAPIs<T>(calls: APICallArray<T>, onSuccess?: (data: T[]) => void): APICallState<T[]> & { fallback: any };
export function UseAPIs<T>(calls: APICallObject<T> | APICallArray<T>, onSuccess?: (data: T[]) => void): (APICallState<MuxedObject<T>> | APICallState<T[]>) & { fallback: any }
{
    if(typeof calls === "function")
    {
        const id = GetCounterId("api");
        const state = UseState({
            [id]: InitAPIState<T[]>()
        });
        UseEffectOnce(async () => {
            const responses = await calls();
            const data: T[] = [];
            for (const response of responses)
            {
                switch(response.statusCode)
                {
                    case 200:
                        data.push(response.data!);
                        break;
                    default:
                        throw new Error("TODO: not implemented: " + response.statusCode);
                }
            }
            if(onSuccess !== undefined)
                onSuccess(data);
            state[id] = {
                started: true,
                success: true,
                data
            };
        });

        return {
            ...state[id],
            fallback: <APIStateHandler state={state[id]} />,
        };
    }

    const apis = ObjectExtensions.Entries(calls).ToDictionary(kv => kv.key as any, kv => UseAPI(kv.value.call, kv.value.onSuccess));
    const apiValues = ObjectExtensions.Values(apis).NotUndefined();

    const started = apiValues.Map(x => x.started).AnyTrue();
    if(started)
    {
        const success = apiValues.Map(x => x.success).All();
        const firstFallback = apiValues.First().fallback;
        if(success)
        {
            return {
                started: true,
                success: true,
                data: ObjectExtensions.Entries(apis).ToDictionary(kv => kv.key, kv => (kv.value! as any).data) as any,
                fallback: firstFallback,
            }
        }

        const errorState = apiValues.Filter(x => (x.success === false) && x.finished).FirstOrUndefined();
        if(errorState === undefined)
        {
            return {
                started: true,
                finished: false,
                success: false,
                fallback: firstFallback
            };
        }
        return {
            started: true,
            success: false,
            finished: true,
            rawBody: (errorState as any).rawBody,
            fallback: <APIStateHandler state={errorState} />
        };
    }

    return {
        started: false,
        finished: false,
        success: false,
        fallback: apiValues.First().fallback,
    };
}