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
import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { IsFragmentElement, IsRenderComponentElement } from "../RenderData";
import { Injectable } from "../decorators";
import { CheckBox } from "./CheckBox";
import { RadioButton } from "./RadioButton";

@Injectable
export class FormField extends Component<{ title: string; description?: string }, SingleRenderValue>
{
    //Protected methods
    protected Render(): RenderValue
    {
        if(this.IsCheckBox())
        {
            return <div className="form-check">
                {...this.children}
                <label className="form-check-label">{this.input.title}</label>
                {this.input.description === undefined ? null : <div className="form-text">{this.input.description}</div>}
            </div>;
        }
        else if(this.IsRadioButtonGroup())
        {
            return <div className="mb-3">
                <label className="form-label">{this.input.title}</label>
                <br />
                {this.WrapRadios()}
                {this.input.description === undefined ? null : <div className="form-text">{this.input.description}</div>}
            </div>;
        }

        return <div className="mb-3">
            <label className="form-label">{this.input.title}</label>
            {...this.children}
            {this.input.description === undefined ? null : <div className="form-text">{this.input.description}</div>}
        </div>;
    }

    //Private methods
    private IsCheckBox()
    {
        const child = this.children[0];
        if( (child === undefined) || (child === null) )
            return false;

        if( (typeof child === "object") && ("type" in child) )
            return child.type === CheckBox;
        return false;
    }

    private IsRadioButtonGroup()
    {
        if(IsFragmentElement(this.children[0]))
        {
            const possibleRadios = this.children[0].children;
            return possibleRadios.Values().Map(x => IsRenderComponentElement(x) && (x.type === RadioButton)).All();
        }
        return false;
    }

    private WrapRadios()
    {
        const fragment = this.children[0] as RenderSpecialElement;
        return fragment.children.map(x => <div className="form-check form-check-inline">{x}</div>);
    }
}