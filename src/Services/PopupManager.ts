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
import { Injectable, Instantiatable, Injector } from "../Injector";
import { Component } from "../Component";
import { VirtualInstance } from "../VirtualInstance";
import { Dialog } from "../Components/Dialog";
import { DialogProperties, DialogRef } from "../Controller/DialogRef";

@Injectable
export class PopupManager
{
    constructor(private mountPoint: HTMLElement)
    {
        this.modalStack = [];
    }

    //Public methods
    public OpenDialog(component: Instantiatable<Component>, dialogTemplate: DialogProperties)
    {
        const modal = new VirtualInstance(Dialog, dialogTemplate, [ new VirtualInstance(component, null, []) ]);
        this.modalStack.push(modal);

        const dialogRef = new DialogRef( this.CloseModal.bind(this, modal) );
        Injector.Register(DialogRef, dialogRef);

        if(this.modalContainer === undefined)
        {
            this.modalContainer = document.createElement("div");
            this.modalContainer.id = "modalContainer";

            this.mountPoint.appendChild(this.modalContainer);
        }

        modal.MountAsChildOf(this.modalContainer);
		this.modalContainer.className = "show";
        document.body.className = "scroll-lock";

        return dialogRef;
    }

    //Private methods
    private CloseModal(modal: VirtualInstance)
    {
        var idx = this.modalStack.indexOf(modal);
        this.modalStack.splice(idx, 1);

        modal.Unmount();
        if(!this.modalContainer!.hasChildNodes())
        {
			this.modalContainer!.className = "";
            document.body.className = "";
        }
    }

    //Private members
    private modalStack: Array<any>;
    private modalContainer?: HTMLElement;
}