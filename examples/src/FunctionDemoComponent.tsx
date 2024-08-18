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

import { Component, Deferred, IntegerSpinner, JSX_CreateElement, RouterState, Use, UseState } from "acfrontend";
import { TimeUtil } from "acts-util-core";

function HeadlineComponent(input: { text: string; })
{
    return <h1>{input.text}</h1>;
}

const HeadlineComponent2 = () => {
    const rt = Use(RouterState);
    return <h2>{rt.ToUrl().ToString()}</h2>
};

function DeferredExample()
{
    return Deferred({
        promise: TimeUtil.Delay(1000),
        resolve: () => "Timer elapsed"
    });
}

function StateExample()
{
    const state = UseState({
        a: 1,
        b: 3
    });
    return <fragment>
        <IntegerSpinner value={state.a} onChanged={newValue => state.a = newValue} />
        <IntegerSpinner link={state.links.b} />
        <p>The sum of these numbers is: {state.a + state.b}</p>
    </fragment>;
}

function ChildrenExample(input: { children: RenderValue; })
{
    return <button type="button">{input.children}</button>
}

export class FunctionDemoComponent extends Component
{    
    protected Render(): RenderValue
    {
        return <fragment>
            <p>Passing input arguments:</p>
            <HeadlineComponent text="Hello from function component :)" />

            <p>Using hooks:</p>
            <HeadlineComponent2 />

            <p>Using deferred functions:</p>
            <DeferredExample />

            <p>Using state:</p>
            <StateExample />

            <p>With children:</p>
            <ChildrenExample>
                Hey I'm a child!
            </ChildrenExample>
        </fragment>;
    }
}