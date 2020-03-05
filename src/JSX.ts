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

type EventHandler = (event: Event) => void;

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

        a: any;
        br: {
        };
        button: {
            children: JsxNode;
            onclick: EventHandler;

            class?: string;
            disabled?: boolean;
        };
        div: any;
        form: any;
        h1: any;
        h2: {
            children: JsxNode;

            class?: string;
        };
        h3: {
            children: string;
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
            oninput?: (event: InputEvent) => void;
        };
        span: any;
        table: {
            children: any[];
            
            class?: string;
        };
        td: {};
        th: {
            children: string;

            colspan?: string;
        };
        tr: {};
        ul: any;
    }
}