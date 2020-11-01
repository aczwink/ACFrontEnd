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

import { Routes } from "acfrontend";
import { HomeComponent } from "./HomeComponent";
import { FormsComponent } from "./FormsComponent";
import { GalleryComponent } from "./GalleryComponent";
import { TooltipComponent } from "./TooltipComponent";
import { WizardComponent } from "./WizardComponent";
import { MenusComponent } from "./MenusComponent";

export const routes: Routes = [
    { path: "forms", component: FormsComponent },
    { path: "gallery", component: GalleryComponent },
    { path: "menus", component: MenusComponent },
    { path: "tooltips", component: TooltipComponent },
    { path: "wizards", component: WizardComponent },
    { path: "", component: HomeComponent },
];