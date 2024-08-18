/**
 * ACFrontEnd
 * Copyright (C) 2020-2024 Amir Czwink (amir130@hotmail.de)
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

import { Component, Stepper, JSX_CreateElement, StepperPage, FormField, LineEdit, IntegerSpinner, DataLink } from "acfrontend";
import { State } from "../../dist/Component";

interface WizardState
{
    name: string;
    age: number;
}

export class FirstPageComponent extends Component<{ nameLink: DataLink<string>; }>
{
    protected Render(): RenderValue
    {
        return <fragment>
            <FormField title="Name">
                <LineEdit link={this.input.nameLink} />
            </FormField>
        </fragment>
    }
}

export class SecondPageComponent extends Component< { name: string; ageLink: DataLink<number>; } >
{
    protected Render(): RenderValue
    {
        return <fragment>
            Hi, {this.input.name}!

            <FormField title="Whats your age?">
                <IntegerSpinner link={this.input.ageLink} />
            </FormField>

            {this.input.ageLink.value < 18 ? "Sorry, but you must be at least 18 to register!" : ""}
        </fragment>;
    }

    //Event handlers
    public OnInitiated()
    {
        this.input.ageLink.Bind(this);
    }

    public OnUnmounted()
    {
        this.input.ageLink.Unbind(this);
    }
}

export class ThirdPageComponent extends Component<{ onValidationChange: (newValue: boolean) => void }>
{
    constructor()
    {
        super();

        this.answer = "";
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            Just to be sure you're not a bot.
            What is 4x * 5y (in alphabetical order without spaces)?
            <FormField title="...">
                <LineEdit value={this.answer} onChanged={newValue => {
                    this.answer = newValue;
                    this.input.onValidationChange(this.answer === "20xy");
                }} />
            </FormField>
        </fragment>
    }

    //Private members
    private answer: string;
}

export class WizardComponent extends Component
{
    constructor()
    {
        super();

        this.sharedState = this.CreateState<WizardState>({
            age: 18,
            name: ""
        });
        this.customValidator = false;
    }

    //Protected methods
    protected Render(): RenderValue
    {
        return <Stepper onAccept={this.OnAccept.bind(this)}>
            <StepperPage title="Page one" validate={() => this.sharedState.name.trim().length > 0}>
                <FirstPageComponent nameLink={this.sharedState.links.name} />
            </StepperPage>
            <StepperPage title="Page two" validate={() => this.sharedState.age >= 18}>
                <SecondPageComponent name={this.sharedState.name} ageLink={this.sharedState.links.age} />
            </StepperPage>
            <StepperPage title="Page three" validate={() => this.customValidator}>
                <ThirdPageComponent onValidationChange={newValue => this.customValidator = newValue} />
            </StepperPage>
        </Stepper>;
    }

    //Private members
    private sharedState: State<WizardState>;
    private customValidator: boolean;

    //Event handlers
    public OnInitiated()
    {
    }

    private OnAccept()
    {
        alert("Registering " + this.sharedState.name + " with age " + this.sharedState.age);
    }
}