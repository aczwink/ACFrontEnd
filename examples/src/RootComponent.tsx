/**
 * ACFrontEnd
 * Copyright (C) 2020-2021 Amir Czwink (amir130@hotmail.de)
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
import { Component, RouterComponent, JSX_CreateElement, Anchor, Switch, ThemingService, Injectable } from "acfrontend";

@Injectable
export class RootComponent extends Component
{
    constructor(private themingService: ThemingService)
    {
        super();

        this.darkMode = false;
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            <div class="vertNav">
                <div style="margin-top: 1.5rem">
                    Dark mode:
                    <Switch checked={this.darkMode} onChanged={this.OnThemeSwitch.bind(this)} />
                </div>
                <ul>
                    <li><Anchor route="/dialogs">Dialogs</Anchor></li>
                    <li><Anchor route="/forms">Forms</Anchor></li>
                    <li><Anchor route="/gallery">Gallery</Anchor></li>
                    <li><Anchor route="/menus">Menus</Anchor></li>
                    <li><Anchor route="/tooltips">Tooltips</Anchor></li>
                    <li><Anchor route="/wizards">Wizards</Anchor></li>
                </ul>
            </div>
            <div class="indentedForVertNav">
                <h1>ACFrontEnd examples</h1>
                <RouterComponent />
            </div>
        </fragment>;
    }

    //Private members
    private darkMode: boolean;

    //Event handlers
    public OnInitiated()
    {
        this.darkMode = this.themingService.IsDarkModeEnabled();
        this.themingService.SetDarkModeStatus(this.darkMode);
    }

    private OnThemeSwitch(newValue: boolean)
    {
        this.darkMode = newValue;
        this.themingService.SetDarkModeStatus(newValue);
    }
}