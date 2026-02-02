/**
 * ACFrontEnd
 * Copyright (C) 2020-2024 Amir Czwink (amir130@hotmail.de)
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

import { MulticastObservable, SubscriberFunction } from "@aczwink/acts-util-core";
import { ObservableEvent } from "../ObservableEvent";

export class PopupRef
{
    constructor(private closer: Function, subscriber: SubscriberFunction<KeyboardEvent>)
    {
        this._keydownEvents = new MulticastObservable<KeyboardEvent>(subscriber);
        this._onClosed = new ObservableEvent();
    }

    //Properties
    public get keydownEvents()
    {
        return this._keydownEvents;
    }

    public get onClosed()
    {
        return this._onClosed;
    }
    
    //Public methods
    public Close()
    {
        this.closer();
        this._onClosed.Emit();
    }

    //Private members
    private _keydownEvents: MulticastObservable<KeyboardEvent>;
    private _onClosed: ObservableEvent;
}