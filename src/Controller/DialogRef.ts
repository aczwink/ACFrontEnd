/**
 * ACFrontEnd
 * Copyright (C) 2019-2024 Amir Czwink (amir130@hotmail.de)
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
import { Property } from "acts-util-core";

import { ObservableEvent } from "../ObservableEvent";

export interface DialogProperties
{
    title: string;
}

export class DialogRef
{
    constructor(private closer: Function)
    {
        this._onAccept = new ObservableEvent();
        this._onClose = new ObservableEvent();
        this._valid = new Property<boolean>(true);
        this._waiting = new Property<boolean>(false);
    }

    //Properties
    public get onAccept()
    {
        return this._onAccept;
    }

    public get onClose()
    {
        return this._onClose;
    }

    public get valid()
    {
        return this._valid;
    }

    public get waiting()
    {
        return this._waiting;
    }

    //Public methods
    public Close()
    {
        this.closer();
        this._onClose.Emit();
    }

    //Private variables
    private _onAccept: ObservableEvent;
    private _onClose: ObservableEvent;
    private _valid: Property<boolean>;
    private _waiting: Property<boolean>;
}