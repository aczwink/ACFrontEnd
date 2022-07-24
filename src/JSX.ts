/**
 * ACFrontEnd
 * Copyright (C) 2019-2022 Amir Czwink (amir130@hotmail.de)
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

//These definitions need to be known here. However, we can not use imports in this file -.- therefore we need to define it here
interface Renderable
{
}

interface Instantiatable<T> extends Function
{
    new (...args: any[]): T;
}

type RenderText = string | number | boolean;
type RenderOther = null | undefined;
interface RenderElement
{
    type: "const" | "fragment" | string | Instantiatable<Renderable>;
    properties: any;
    children: RenderValue[];
}
type SingleRenderValue = RenderText | RenderOther | RenderElement;
type RenderValue = SingleRenderValue | RenderValue[];

type EventHandler<EventType = Event> = (event: EventType) => void;

interface JSX_GlobalEventHandlers
{
    onclick?: EventHandler<MouseEvent>;
    onmouseenter?: EventHandler<MouseEvent>;
    onmouseleave?: EventHandler<MouseEvent>;
    onmouseout?: EventHandler<MouseEvent>;
}

interface JSX_Element extends JSX_GlobalEventHandlers
{
    class?: string;
    style?: string;
}

declare module JSX
{
    type Element = any; //Should be RenderValue but then does not work for RenderComponent

    interface ElementAttributesProperty
    {
        __jsxProperties: any; //for components the name of the member that defines the attributes types
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
            children: RenderValue;

            class?: string;
            href?: string;
            onclick?: EventHandler<MouseEvent>;
            role?: "button";
            style?: string;
            target?: "_blank";
            title?: string;
        };
        abbr: {
            children: string;
            title: string;
        }
        br: {
        };
        
        button: {
            children?: RenderValue;
            "aria-label"?: string;
            disabled?: boolean;
            title?: string;
            type: "button" | "submit";
        } & JSX_Element;

        div: {
            children?: RenderValue;
            innerHTML?: string;
            role?: "status";
            tabindex?: string;
        } & JSX_Element;

        fieldset: {
            children: RenderValue;
        };

        form: {
            children: RenderValue;
            onsubmit: EventHandler;
        };
        h1: any;
        h2: {
            children: RenderValue;

            class?: string;
        };
        h3: {
            children: RenderValue;

            style?: string;
        }
        h4: any;

        h5: {
            children: string;

            class?: string;
        };

        hr: {
        };

        iframe: {
            src: string;

            allowfullscreen?: boolean;
            style?: string;
        };

        img: {
            src: string;
            
            oncontextmenu?: EventHandler<MouseEvent>;
        } & JSX_Element;

        input: {
            checked?: boolean;
            class?: string;
            disabled?: boolean;
            min?: number;
            onblur?: EventHandler<FocusEvent>;
            onchange?: EventHandler;
            onclick?: EventHandler;
            onfocus?: EventHandler<FocusEvent>;
            oninput?: EventHandler<InputEvent>;
            onkeydown?: EventHandler<KeyboardEvent>;
            onkeyup?: EventHandler<KeyboardEvent>;
            placeholder?: string;
            step?: string;
            type: "checkbox" | "datetime-local" | "file" | "number" | "password" | "radio" | "text",
            value?: number | string;
        };

        label: {
            children: RenderValue;
            class?: string;
        };

        legend: {
            children: RenderText;
        };

        li: {
            children: RenderValue;

            class?: string;
            tabindex?: number;

            onblur?: EventHandler<FocusEvent>;
            onfocus?: EventHandler<FocusEvent>;
            onkeyup?: EventHandler<KeyboardEvent>;
            onmousedown?: EventHandler<MouseEvent>;
        };

        nav: any;

        object: {
            data: string;
            id: string;
            style: string;
            type: string;
            onload: EventHandler<Event>;
        };

        option: {
            children: string;
            disabled?: boolean;
            selected?: boolean;
            value?: number | string;
        };

        ol: {
        };

        p: {
            children: string;
            style?: string;
        };
        
        progress: {
            max: number | string;
            style?: string;
            value: number | string;
        };
        select: {
            children: any[];

            class?: string;
            onchange?: EventHandler;
            oninput?: EventHandler<InputEvent>;
        };

        small: {
            children: string;
            class?: string;
        };

        source: {
            src: string;
        };
        span: {
            children?: RenderValue;
            class?: string;
            style?: string;
        };

        table: {
            children: RenderValue;
            
            class?: string;
            id?: string;
        };

        tbody: {
        };

        textarea: {
            children: string;
            class?: string;
            cols: string;
            onchange?: EventHandler;
            onkeydown?: EventHandler<KeyboardEvent>;
            oninput?: EventHandler<InputEvent>;
            readonly?: boolean;
            rows: string;
        };
        
        td: {
            children: RenderValue;

            class?: string;
            colspan?: string;

            onclick?: EventHandler<MouseEvent>;
        };
        th: {
            children: RenderValue;

            colspan?: string;
        };

        thead: {
        };

        tr: {
            children: RenderValue;
            class?: string;
            oncontextmenu?: EventHandler<MouseEvent>;
            onselectstart?: EventHandler<Event>;
        };
        ul: any;
        video: {
            children: RenderValue;

            autoplay?: boolean;            
            controls?: boolean;
            loop?: boolean;
            muted?: boolean;
            onended?: EventHandler<Event>;
            onpause?: EventHandler<Event>;
            onplay?: EventHandler<Event>;
            onseeked?: EventHandler<Event>;
            onseeking?: EventHandler<Event>;
            ontimeupdate?: EventHandler<Event>;
            poster?: string;
            style?: string;
        };
    }
}