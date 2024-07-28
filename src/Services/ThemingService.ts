/**
 * ACFrontEnd
 * Copyright (C) 2021-2024 Amir Czwink (amir130@hotmail.de)
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

import { Injectable } from "../ComponentManager";

@Injectable
export class ThemingService
{
    constructor()
    {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.SetPreferredUserTheme.bind(this));
    }

    //Public methods
    public IsDarkModeEnabled()
    {
        const attrib = document.documentElement.getAttribute("data-bs-theme");
        return attrib === "dark";
    }

    public SetDarkModeStatus(enabled: boolean)
    {
        const theme = enabled ? 'dark' : 'light';
        document.documentElement.setAttribute('data-bs-theme', theme);
    }

    public SetPreferredUserTheme()
    {
        this.SetDarkModeStatus(this.DoesUserPreferDarkMode());
    }

    //Private methods
    private DoesUserPreferDarkMode()
    {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}