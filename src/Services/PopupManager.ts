/**
 * ACFrontEnd
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
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
import { Dictionary, Instantiatable } from "acts-util-core";

import { Injectable } from "../ComponentManager";
import { Component } from "../Component";
import { VirtualInstance } from "../VirtualInstance";
import { Dialog } from "../Components/Dialog";
import { DialogProperties, DialogRef } from "../Controller/DialogRef";
import { RootInjector } from "../App";
import { VirtualNode } from "../VirtualNode";
import { VirtualElement } from "../VirtualElement";
import { PopupRef } from "../Controller/PopupRef";

interface PopupContainer
{
    container: VirtualElement;
    popups: VirtualNode[];
}

@Injectable
export class PopupManager
{
    constructor(private root: VirtualNode, private mountPoint: HTMLElement)
    {
        this.popupContainers = {};
    }

    //Public methods
    public OpenDialog(component: Instantiatable<Component>, dialogTemplate: DialogProperties)
    {
        const modal = new VirtualInstance(Dialog, dialogTemplate, [ new VirtualInstance(component, dialogTemplate.input || null, []) ]);
        const ref = this.OpenPopup("modalContainer", modal, { className: "show" });

        const dialogRef = new DialogRef( this.CloseModal.bind(this, ref) );
        RootInjector.RegisterInstance(DialogRef, dialogRef);

        document.body.className = "scroll-lock";

        return dialogRef;
    }

    public OpenModeless(component: Instantiatable<Component>, properties: Dictionary<any>)
    {
        const instance = new VirtualInstance(component, properties, []);
        this.root.AddChild(instance);
    }

    public OpenPopup(containerId: string, popupNode: VirtualNode, properties?: any): PopupRef
    {
        let container = this.popupContainers[containerId];
        if(container === undefined)
        {
            properties.id = containerId;
            container = {
                container: new VirtualElement("div", properties),
                popups: []
            };
            this.popupContainers[containerId] = container;
            const adder = () => this.root.AddChild(container!.container);
            adder.CallImmediate();
        }
        container.popups.push(popupNode);
        container.container.children = container.popups;

        return new PopupRef( this.ClosePopup.bind(this, containerId, popupNode) );
    }

    //Private methods
    private CloseModal(ref: PopupRef)
    {
        ref.Close();

        if(this.popupContainers["modalContainer"] === undefined)
        {
            document.body.className = "";
        }
    }

    private ClosePopup(containerId: string, popupNode: VirtualNode)
    {
        const container = this.popupContainers[containerId]!;

        container.popups.Remove(container.popups.indexOf(popupNode));
        container.container.children = container.popups;
        
        if(container.popups.length === 0)
        {
            this.root.RemoveChild(container.container);
            delete this.popupContainers[containerId];
        }
    }

    //Private members
    private popupContainers: Dictionary<PopupContainer>;
}