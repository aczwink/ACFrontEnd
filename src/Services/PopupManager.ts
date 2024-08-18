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
import { Dictionary, Observer } from "acts-util-core";

import { Dialog } from "../Components/Dialog";
import { DialogProperties, DialogRef } from "../Controller/DialogRef";
import { PopupRef } from "../Controller/PopupRef";
import { Injectable } from "../decorators";
import { VirtualElement } from "../VirtualTree/VirtualElement";
import { TransformRenderValueToVirtualNode } from "../VirtualTree/VirtualTreeCreator";
import { VirtualNode } from "../VirtualTree/VirtualNode";

interface PopupDefinition
{
    ref: PopupRef;
    popupNode: VirtualNode;
}

interface PopupContainer
{
    container: VirtualElement;
    popups: VirtualNode[];
    popupRefs: PopupRef[];
}

interface ModalProperties
{
    className?: string;
    withBackdrop?: boolean;
}

@Injectable
export class PopupManager
{
    constructor(private root: VirtualNode)
    {
        this.popupContainers = {};
        this.modalBackdropNode = null;
    }

    //Public methods
    public OpenDialog(content: RenderValue, dialogTemplate: DialogProperties)
    {
        const modal: RenderElement = {
            type: Dialog,
            properties: dialogTemplate,
            children: [content]
        };
        const ref = this.OpenModalInternal(modal, true);
        const dialogRef = new DialogRef( this.CloseModal.bind(this, ref.ref) );
        ref.popupNode.injector?.RegisterInstance(DialogRef, dialogRef);

        this.ShowPopup(ref.containerId, ref);

        return dialogRef;
    }

    public OpenModal(content: RenderValue, properties: ModalProperties)
    {
        const hasBackdrop = properties.withBackdrop === undefined ? true : properties.withBackdrop;

        const children = [];
        if(hasBackdrop)
        {
            children.push({
                type: "button",
                attributes: {},
                properties: {
                    textContent: "\u00d7",
                    onclick: () => ref.Close()
                },
                children: []
            });
        }
        children.push(content);

        let className = "modal";
        if(properties.className)
            className += " " + properties.className;

        const modal: RenderElement = {
            type: "div",
            attributes: {},
            properties: {
                className
            },
            children
        };

        const modalRef = this.OpenModalInternal(modal, hasBackdrop);
        const ref = modalRef.ref;
        ref.keydownEvents.Subscribe({ next: event => {
            if(event.keyCode === 27) //escape
                ref.Close();
        }});
        this.ShowPopup(modalRef.containerId, modalRef);

        return ref;
    }

    public OpenModeless(content: RenderValue)
    {
        const vNode = TransformRenderValueToVirtualNode(content)!;
        const ref = new PopupRef( () => this.root.RemoveChild(vNode), this.OnNewKeyBoardSubscriber.bind(this, "") );
        this.root.AddChild(vNode);

        return ref;
    }

    public OpenPopup(containerId: string, content: RenderValue, properties?: any): PopupRef
    {
        this.CreatePopupContainer(containerId, properties);
        const popup = this.CreatePopup(containerId, content);
        this.ShowPopup(containerId, popup);
        return popup.ref;
    }

    //Private methods
    private CreatePopup(containerId: string, content: RenderValue): PopupDefinition
    {
        const popupNode = TransformRenderValueToVirtualNode(content)!;

        const ref = new PopupRef( this.ClosePopup.bind(this, containerId, popupNode), this.OnNewKeyBoardSubscriber.bind(this, containerId));
        popupNode.EnsureHasOwnInjector();
        popupNode.injector!.RegisterInstance(PopupRef, ref);

        return { popupNode, ref };
    }

    private CreatePopupContainer(containerId: string, properties: any)
    {
        let container = this.popupContainers[containerId];

        if(container === undefined)
        {
            if(properties === undefined)
                properties = {};
            properties.id = containerId;
            container = {
                container: new VirtualElement("div", properties, {}),
                popups: [],
                popupRefs: []
            };
            this.popupContainers[containerId] = container;
            const adder = () => {
                this.root.AddChild(container!.container);
            };
            adder.CallImmediate();
        }
    }

    private CloseModal(ref: PopupRef)
    {
        ref.Close();

        if(this.popupContainers["modalContainer"] === undefined)
        {
            const classes = document.body.className.split(" ").Values().ToSet();
            classes.delete("scroll-lock");
            document.body.className = classes.ToArray().join(" ");

            if(this.modalBackdropNode !== null)
            {
                this.root.RemoveChild(this.modalBackdropNode);
                this.modalBackdropNode = null;
            }
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

    private EnsureBackdropIsVisible()
    {
        if(this.modalBackdropNode === null)
        {
            this.modalBackdropNode = new VirtualElement("div", {}, { "class": "modal-backdrop fade show" });
            this.root.AddChild(this.modalBackdropNode);
        }
    }

    private OpenModalInternal(modal: RenderElement, showBackdrop: boolean)
    {
        const containerId = "modalContainer";
        this.CreatePopupContainer(containerId, {
            onclick: (event: MouseEvent) => {
                if(event.target === event.currentTarget)
                    this.CloseModal(ref)
            },
            oncontextmenu: (event: MouseEvent) => {
                if(event.target === event.currentTarget)
                    this.CloseModal(ref);
            }
        });
        const popup = this.CreatePopup(containerId, modal);
        const ref = popup.ref;
        document.body.className = document.body.className.split(" ").concat(["scroll-lock"]).join(" ");

        if(showBackdrop)
            this.EnsureBackdropIsVisible();

        const modalRef = new PopupRef( this.CloseModal.bind(this, ref), this.OnNewKeyBoardSubscriber.bind(this, containerId) );
        return { popupNode: popup.popupNode, ref: modalRef, containerId };
    }

    private ShowPopup(containerId: string, def: PopupDefinition)
    {
        let container = this.popupContainers[containerId]!;

        container.popups.push(def.popupNode);
        container.popupRefs.push(def.ref);
        container.container.children = container.popups;
    }

    //Private members
    private popupContainers: Dictionary<PopupContainer>;
    private modalBackdropNode: VirtualNode | null;

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