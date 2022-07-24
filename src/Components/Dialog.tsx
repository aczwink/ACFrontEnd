/**
 * ACFrontEnd
 * Copyright (C) 2019-2020,2022 Amir Czwink (amir130@hotmail.de)
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
import { Injectable } from "../ComponentManager";
import { DialogProperties, DialogRef } from "../Controller/DialogRef";
import { ProgressSpinner } from "./ProgressSpinner";

@Injectable
export class Dialog extends Component<DialogProperties, RenderValue>
{
    constructor(private dialogRef: DialogRef)
    {
        super();

        this.dialogRef.waiting.Subscribe(() => this.waiting = this.dialogRef.waiting.Get());
        this.waiting = this.dialogRef.waiting.Get();

        this.dialogRef.valid.Subscribe(() => this.isValid = this.dialogRef.valid.Get());
        this.isValid = this.dialogRef.valid.Get();
    }

    //Protected methods
    protected Render(): RenderValue
    {            
        return <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{this.input.title}</h5>
                    <button type="button" className="btn-close" onclick={this.OnCancelActivated.bind(this)} aria-label="Close" disabled={this.waiting} />
                </div>
                <div className="modal-body">{this.waiting ? <ProgressSpinner /> : this.children}</div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-primary" disabled={this.waiting || !this.isValid} onclick={this.OnOkActivated.bind(this)}>OK</button>
                    <button type="button" className="btn btn-secondary" onclick={this.OnCancelActivated.bind(this)} disabled={this.waiting}>Cancel</button>
                </div>
                </div>
            </div>
        </div>;
    }

    //Private members
    private waiting: boolean;
    private isValid: boolean;

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