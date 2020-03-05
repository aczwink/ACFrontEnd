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

export const TimeUtil = new class
{
    //Public methods
    public DurationToString(duration: number | null)
    {
        if(duration === null)
            return '?';
            
        var mins = Math.floor(duration / 60);
        var secs = duration - mins * 60;
        
        if(mins && secs)
            return mins + ' min ' + secs + ' s';
        if(mins)
            return mins + ' min';
        return secs + ' s';
    }
};