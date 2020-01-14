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
import { Injectable } from "../Injector";
import { Component } from "../Component";
import { RenderNode } from "../VirtualNode";
import { JSX_CreateElement } from "../JSX_CreateElement";

@Injectable
export class MaleIcon extends Component
{
    //Input
    input!: {};

    //Protected methods
    protected Render(): RenderNode
    {
        const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 0; height: 0; visibility: hidden; position: absolute;">
		<symbol viewBox='32 29 39 39' id='icon-male'>
			<path fill="currentcolor" d="M48.8,67.7c4.4,0,8.6-1.7,11.7-4.8c6.1-6.1,6.4-15.7,1-22.2l7-7v3.5c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V30  c0-0.2,0-0.4-0.1-0.5c0,0,0,0,0,0c-0.2-0.4-0.4-0.7-0.8-0.8c0,0,0,0,0,0c-0.2-0.1-0.4-0.1-0.5-0.1h-7.1c-0.8,0-1.5,0.7-1.5,1.5  s0.7,1.5,1.5,1.5h3.5l-7,7c-3-2.5-6.7-3.8-10.6-3.8c-4.4,0-8.6,1.7-11.7,4.8c-6.4,6.4-6.4,16.9,0,23.3C40.2,66,44.4,67.7,48.8,67.7z   M39.2,41.7c2.5-2.5,5.9-4,9.5-4c3.6,0,7,1.4,9.5,4c5.3,5.3,5.3,13.8,0,19.1c-2.5,2.5-5.9,4-9.5,4c-3.6,0-7-1.4-9.5-4  C34,55.5,34,46.9,39.2,41.7z"/>
		</symbol>
		</svg>
		<svg viewBox="0 0 32 32" focusable="false"><use xlink:href="#icon-male"></use></svg>
        `;
        return <div class="icon" innerHTML={svg}></div>;
    }
}