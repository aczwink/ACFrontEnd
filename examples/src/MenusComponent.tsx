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

import { Component, JSX_CreateElement, Injectable, Menu, MenuItem, MenuManager, Anchor } from "acfrontend";


@Injectable
export class MenusComponent extends Component
{
    constructor(private menuManager: MenuManager)
    {
        super();
    }
    
    protected Render(): RenderValue
    {
        return <button type="button" onclick={this.OnOpenMenu.bind(this)}>Press me</button>;
    }

    //Event handlers
    private OnOpenMenu(event: MouseEvent)
    {
        const menu = <Menu>
            <MenuItem><a onclick={() => alert("Item 1 clicked")}>Item 1</a></MenuItem>
            <MenuItem><a onclick={() => alert("Item 2 clicked")}>Item 2</a></MenuItem>
            <MenuItem><Anchor route="/">Route to root</Anchor></MenuItem>
        </Menu>;

        this.menuManager.OpenMenu(menu, event);
    }
}