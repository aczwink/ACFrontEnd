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
export class FemaleIcon extends Component
{
    //Input
    input!: {};

    //Protected methods
    protected Render(): RenderNode
    {
        const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 0; height: 0; visibility: hidden; position: absolute;">
		<symbol viewBox='33 28 33 48' id='icon-female'>
			<path fill="currentcolor" d="M48.5,61.4v7.2H45c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5h3.5V75c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5v-3.4H55  c0.8,0,1.5-0.7,1.5-1.5s-0.7-1.5-1.5-1.5h-3.5v-7.2c8.4-0.8,15-7.8,15-16.4c0-9.1-7.4-16.5-16.5-16.5S33.5,35.9,33.5,45  C33.5,53.6,40.1,60.7,48.5,61.4z M50,31.5c7.4,0,13.5,6.1,13.5,13.5S57.4,58.5,50,58.5S36.5,52.4,36.5,45S42.6,31.5,50,31.5z"/>
		</symbol>
		</svg>
		<svg viewBox="0 0 32 32" focusable="false"><use xlink:href="#icon-female"></use></svg>
		`;
        return <div class="icon" innerHTML={svg}></div>
    }
}