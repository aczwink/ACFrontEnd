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
import { Dictionary, Instantiatable, Observer } from "acts-util-core";

import { Injectable } from "../ComponentManager";
import { Component } from "../Component";
import { VirtualInstance } from "../VirtualInstance";
import { Dialog } from "../Components/Dialog";
import { DialogProperties, DialogRef } from "../Controller/DialogRef";
import { RootInjector } from "../App";
import { VirtualNode } from "../VirtualNode";
import { VirtualElement } from "../VirtualElement";
import { PopupRef } from "../Controller/PopupRef";
import { RenderNode } from "../main";

interface PopupContainer
{
    container: VirtualElement;
    popups: VirtualNode[];
    popupRefs: PopupRef[];
}

interface ModalProperties<InputType>
{
    className?: string;
    input: InputType;
}

@Injectable
export class PopupManager
{
    constructor(private root: VirtualNode)
    {
        this.popupContainers = {};
    }

    //Public methods
    public OpenDialog(component: Instantiatable<Component>, dialogTemplate: DialogProperties)
    {
        const modal = new VirtualInstance<Dialog, DialogProperties, VirtualNode>(Dialog, dialogTemplate, new VirtualInstance(component, dialogTemplate.input || null));
        const ref = this.OpenModalInternal(modal);

        const dialogRef = new DialogRef( this.CloseModal.bind(this, ref) );
        RootInjector.RegisterInstance(DialogRef, dialogRef);

        return dialogRef;
    }

    public OpenModal<InputType, ChildrenType>(component: Instantiatable<Component<InputType, ChildrenType>>, properties: ModalProperties<InputType>)
    {
        const className = "modal " + (properties.className || "");
        const modal = new VirtualElement("div", { className: className });

        const ref = this.OpenModalInternal(modal);
        modal.children = [
            new VirtualElement("button", {textContent: "\u00d7", onclick: ref.Close.bind(ref)}),
            new VirtualInstance<Component<InputType, ChildrenType>, InputType, ChildrenType>(component, properties.input)
        ];

        ref.keydownEvents.Subscribe({ next: event => {
            if(event.keyCode === 27) //escape
                ref.Close();
        }});

        return ref;
    }

    public OpenModeless(content: Instantiatable<Component> | VirtualNode, properties?: Dictionary<any>)
    {
        if(!(content instanceof VirtualNode))
            content = new VirtualInstance(content, properties || null);
        const ref = new PopupRef( () => this.root.RemoveChild(content as VirtualNode), this.OnNewKeyBoardSubscriber.bind(this, "") );
        this.root.AddChild(content);

        return ref;
    }

    public OpenPopup(containerId: string, popupNode: VirtualNode, properties?: any): PopupRef
    {
        let container = this.popupContainers[containerId];

        const ref = new PopupRef( this.ClosePopup.bind(this, containerId, popupNode), this.OnNewKeyBoardSubscriber.bind(this, containerId));
        popupNode.EnsureHasOwnInjector();
        popupNode.injector!.RegisterInstance(PopupRef, ref);

        if(container === undefined)
        {
            properties.id = containerId;
            container = {
                container: new VirtualElement("div", properties),
                popups: [],
                popupRefs: []
            };
            this.popupContainers[containerId] = container;
            const adder = () => {
                this.root.AddChild(container!.container);
            };
            adder.CallImmediate();
        }
        container.popups.push(popupNode);
        container.container.children = container.popups;

        container.popupRefs.push(ref);

        return ref;
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

    private OpenModalInternal(modal: VirtualNode)
    {
        const containerId = "modalContainer";
        const ref = this.OpenPopup(containerId, modal, { className: "show", onclick: (event: MouseEvent) => {
            if(event.target === event.currentTarget)
                this.CloseModal(ref)
        }});

        document.body.className = "scroll-lock";

        return ref;
    }

    //Private members
    private popupContainers: Dictionary<PopupContainer>;

    //Event handlers
    private OnContainerKeyDown(containerId: string, observer: Observer<KeyboardEvent>, event: Event)
    {
        const container = this.popupContainers[containerId]!;
        const top = container.popupRefs[container.popupRefs.length -1];

        observer.next(event as KeyboardEvent);
    }

    private OnNewKeyBoardSubscriber(containerId: string, observer: Observer<KeyboardEvent>)
    {
        const container = this.popupContainers[containerId]!;
        const func = this.OnContainerKeyDown.bind(this, containerId, observer);
        document.addEventListener("keydown", func);

        return {
            Unsubscribe()
            {
                container.container.domNode!.removeEventListener("keydown", func);
            }
        };
    }
}