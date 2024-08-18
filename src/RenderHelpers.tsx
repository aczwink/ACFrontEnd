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
import { UseEffectOnce, UseState } from "./Hooks";
import { ProgressSpinner } from "./Components/ProgressSpinner";
import { DataLink } from "./DataBinding";


interface APIResponse<DataType>
{
	statusCode: number;
    data?: DataType;
    rawBody: any;
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

export function InitAPIState<T>(): APICallState<T>
{
    return { success: false, finished: false, started: false };
}

export function UseAPI<T>(call: () => Promise<APIResponse<T>>, onSuccess?: (data: T) => void)
{
    const state = UseState({
        apiState: InitAPIState<T>()
    });
    UseEffectOnce(async () => {
        CallAPI(call, state.links.apiState, onSuccess);
    });

    return {
        ...state.apiState,
        fallback: <APIStateHandler state={state.apiState as any} />
    };
}