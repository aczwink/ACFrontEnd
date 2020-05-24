/**
 * ACFrontEnd
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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
import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { Injectable } from "../ComponentManager";
import { RenderNode } from "../VirtualNode";

export class Tab extends Component
{
    input!:
    {
        key: string;
        children: RenderNode;
    }

    //Protected methods
    protected Render(): RenderNode
    {
        return this.input.children;
    }
}

export class TabHeader extends Component
{
    input!:
    {
        children: RenderNode[];
    }

    //Protected methods
    protected Render(): RenderNode
    {
        return <div class="subPageNav">
            {...this.input.children}
        </div>;
    }
}

@Injectable
export class TabGroup extends Component
{
    input!:
    {
        activeKey: string;
        activeKeyChanged: (newKey: string) => void;
        children: Tab[];
    }

    //Protected methods
    protected Render(): RenderNode
    {
        return <ul>{...this.RenderHeader()}</ul>;
    }

    //Private methods
    private FindActiveTab()
    {
        return this.input.children.find( tab => tab.input.key === this.input.activeKey );
    }

    private RenderHeader()
    {
        const activeTab = this.FindActiveTab();

        return this.input.children.map(tab => {
            const className = tab === activeTab ? "active" : "";
            return <li class={className}>
                <a onclick={this.input.activeKeyChanged.bind(this, tab.input.key)}>{tab}</a>
            </li>}
        );
    }
}