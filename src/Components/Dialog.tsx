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
import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { Injectable } from "../Injector";
import { DialogProperties, DialogRef } from "../Controller/DialogRef";
import { RenderNode } from "../VirtualNode";
import { ProgressSpinner } from "./ProgressSpinner";

interface DialogPropertiesWithChildren extends DialogProperties
{
    children: RenderNode;
}

@Injectable
export class Dialog extends Component
{
    //Input
    input!: DialogPropertiesWithChildren;

    constructor(private dialogRef: DialogRef)
    {
        super();

        this.dialogRef.waiting.Subscribe(() => this.waiting = this.dialogRef.waiting.Get());
        this.waiting = this.dialogRef.waiting.Get();
    }

    //Protected methods
    protected Render(): RenderNode
    {
        const header = <div>
            <h4>{this.input.title}</h4>
            <button onclick={this.OnCancelActivated.bind(this)}>{"\u00d7"}</button>
        </div>;

        const footer = <div>
            <div class="row">
                <button onclick={this.OnOkActivated.bind(this)}>OK</button>
                <button onclick={this.OnCancelActivated.bind(this)} class="outline">Cancel</button>
            </div>
        </div>;

        const loader = <div><ProgressSpinner /></div>;

        return <div class={"dialog" + (this.waiting ? " waiting" : "")}>
            {header}
            {this.input.children}
            {footer}
            {loader}
        </div>;
    }

    //Private members
    private waiting: boolean;

    //Event handlers
    private OnCancelActivated()
    {
        this.dialogRef.Close();
    }

    private OnOkActivated()
    {
        this.dialogRef.onAccept.Emit();
    }
}