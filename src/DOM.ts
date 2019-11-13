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

export interface MountPoint
{
    mountPointNode: Node;
    referenceNode?: Node;
    reference: "before" | "appendChild";
}

export const DOM = new class
{
    public Mount(node: Node, mountPoint: MountPoint)
    {
        switch(mountPoint.reference)
        {
            case "appendChild":
                mountPoint.mountPointNode.appendChild(node);
                break;
            case "before":
                mountPoint.mountPointNode.insertBefore(node, mountPoint.referenceNode!);
                break;
        }
    }

    public ReplaceNode(oldNode: Node, newNode: Node)
    {
        /**
         * There is oldNode.replaceWith(newNode) but it is not standardized yet.
         */
        const parent = oldNode.parentNode;
        if(parent === null)
            return;
        parent.replaceChild(newNode, oldNode);
    }

    public Unmount(node: Node)
    {
        /**
         * There is node.remove(); but it is not standardized yet.
         */
        if(node.parentNode !== null)
            node.parentNode.removeChild(node);
    }
}