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
declare module JSX
{
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
        fragment: {}; //special for VirtualFragment

        a: any;
        br: {
        };
        button: {
            children: string;
            onclick: () => void;

            class?: string;
            disabled?: boolean;
        };
        div: any;
        form: any;
        h1: any;
        h2: {
            children: any[];

            class?: string;
        };
        h4: any;
        hr: {
        };
        img: {
            src: string;
            
            class?: string;
        };
        input: {
            type: "text",
            value: string;

            placeholder?: string;
            
            onkeyup?: Function;
        };
        li: any;
        nav: any;
        option: any;
        select: any;
        span: any;
        table: {
            children: any[];
            
            class?: string;
        };
        td: {};
        th: {};
        tr: {};
        ul: any;
    }
}