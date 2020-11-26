/**
 * ACFrontEnd
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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

import { Component, JSX_CreateElement, Injectable, PopupManager, LineEdit, DialogRef } from "acfrontend";

@Injectable
export class RegisterComponent extends Component
{
    constructor(private dialogRef: DialogRef)
    {
        super();
        this.entered = "";
        this.OnValueChanged("");

        dialogRef.onAccept.Subscribe(this.OnAccept.bind(this));
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            Please enter your age:
            <LineEdit value={this.entered} onChanged={this.OnValueChanged.bind(this)} />
        </fragment>
    }

    //Private members
    private entered: string;

    //Event handlers
    private OnAccept()
    {
        this.dialogRef.waiting.Set(true);
        setTimeout(() => {
            this.dialogRef.waiting.Set(false);
            alert("Welcome, new user!");
            this.dialogRef.Close();
        }, 3000);
    }

    private OnValueChanged(newValue: string)
    {
        this.entered = newValue;
        const parsed = parseInt(this.entered);
        this.dialogRef.valid.Set(!Number.isNaN(parsed) && parsed >= 18 && parsed <= 100)
    }
}

@Injectable
export class DialogsComponent extends Component
{
    constructor(private popupManager: PopupManager)
    {
        super();
    }
    
    protected Render(): RenderValue
    {
        return <button type="button" onclick={this.OnOpenDialog.bind(this)}>Press me</button>;
    }

    //Event handlers
    private OnOpenDialog()
    {
        this.popupManager.OpenDialog(<RegisterComponent />, { title: "Register" });
    }
}