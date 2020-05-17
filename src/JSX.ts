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

type EventHandler<EventType = Event> = (event: EventType) => void;

declare module JSX
{
    /*
    //We would need that this interface extends VirtualNode.
    However, we can not use imports in this file -.-
    it therefore does not work.
    interface Element
    {
    }
    */
   type JsxNode = any;

    interface ElementAttributesProperty
    {
        input:any; //for components the name of the member that defines the attributes types
    }

    interface ElementChildrenAttribute
    {
        children: {};
    }

    interface IntrinsicElements
    {
        const: {}; //special for VirtualConstNode
        fragment: {}; //special for VirtualFragment

        a: {
            children: JsxNode;

            href?: string;
            onclick?: EventHandler<MouseEvent>;
            target?: "_blank";
            style?: string;
        };
        abbr: {
            children: string;
            title: string;
        }
        br: {
        };
        button: {
            children: JsxNode;
            type: "button" | "submit";

            class?: string;
            disabled?: boolean;
            onclick?: EventHandler;
        };
        div: any;
        form: {
            children: JsxNode;
            onsubmit: EventHandler;
        };
        h1: any;
        h2: {
            children: JsxNode;

            class?: string;
        };
        h3: {
            children: JsxNode;

            style?: string;
        }
        h4: any;
        hr: {
        };
        img: {
            src: string;
            
            class?: string;
            style?: string;
        };
        input: {
            type: "checkbox" | "datetime-local" | "number" | "password" | "text",

            checked?: boolean;
            disabled?: boolean;
            placeholder?: string;
            value?: number | string;

            onchange?: EventHandler;
            onclick?: EventHandler;
            onkeyup?: Function;
        };
        li: any;
        nav: any;
        option: {
            children: string;

            selected?: boolean;
            value?: string;
        };
        select: {
            children: any[];

            onchange?: EventHandler;
            oninput?: EventHandler<InputEvent>;
        };
        span: any;
        table: {
            children: any[];
            
            class?: string;
            id?: string;
        };
        td: {
            children: JsxNode;

            class?: string;
            colspan?: string;

            onclick?: EventHandler<MouseEvent>;
        };
        th: {
            children: JsxNode;

            colspan?: string;
        };
        tr: {
            children: JsxNode;

            class?: string;

            oncontextmenu?: EventHandler<MouseEvent>;
        };
        ul: any;
    }
}