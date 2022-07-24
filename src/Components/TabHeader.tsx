/**
 * ACFrontEnd
 * Copyright (C) 2020,2022 Amir Czwink (amir130@hotmail.de)
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
import { Component, RenderComponentChild } from "../Component";
import { Injectable } from "../ComponentManager";
import { JSX_CreateElement } from "../JSX_CreateElement";

type TabInput = { key: string; };
export class Tab extends Component<TabInput, string>
{
    //Protected methods
    protected Render(): RenderValue
    {
        return this.children[0];
    }
}

type TabGroupInput = {
    activeKey: string;
    activeKeyChanged: (newKey: string) => void;
}

@Injectable
export class TabGroup extends Component<TabGroupInput, RenderComponentChild<Tab>[]>
{
    //Protected methods
    protected Render(): RenderValue
    {
        return <ul className="nav nav-tabs">{...this.RenderHeader()}</ul>;
    }

    //Private methods
    private FindActiveTab()
    {
        return this.children.find( tab => tab.properties.key === this.input.activeKey );
    }

    private RenderHeader(): SingleRenderValue[]
    {
        const activeTab = this.FindActiveTab();

        return this.children.map(tab => {
            const className = "nav-link" + (tab === activeTab ? " active" : "");
            return <li className="nav-item">
                <a className={className} onclick={this.input.activeKeyChanged.bind(this, tab.properties.key)}>{tab}</a>
            </li>}
        );
    }
}

export class TabHeader extends Component<{}, RenderValue>
{
    //Protected methods
    protected Render(): RenderValue
    {
        return this.children;
    }
}