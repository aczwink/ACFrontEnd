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
import { Component } from "../Component";
import { JSX_CreateElement } from "../JSX_CreateElement";
import { IsRenderElement } from "../RenderData";
import { DontBind } from "../decorators";

type SelectableTableInput<RowKeyType> = {
    columns: string[];
    multiSelections: boolean,
    rowKeys: RowKeyType[];
    selectedRowKeys: RowKeyType[];
    selectionChanged: (selection: RowKeyType[]) => void;
};

export class SelectableTable<RowKeyType> extends Component<SelectableTableInput<RowKeyType>, RenderValue>
{
    constructor()
    {
        super();

        this.rowCounter = 0;
        this.selection = new Set;
    }

    //Protected methods
    protected Render(): RenderValue
    {
        this.rowCounter = 0;

        return <table className="table table-striped table-hover">
            <thead>
                <tr>
                    {this.input.columns.map( col => <th>{col}</th>)}
                </tr>
            </thead>
            <tbody>{...this.children.map(row => this.RenderChild(row))}</tbody>
        </table>;
    }

    //Private members
    @DontBind
    private selection: Set<RowKeyType>;
    @DontBind
    private rowCounter: number;

    //Private methods
    private AddToSelection(rowKey: RowKeyType)
	{
        this.selection.add(rowKey);
    }

    private ClearSelection()
	{
		for (var idx of this.selection)
			this.RemoveFromSelection(idx);
	}
    
    private RenderChild(child: RenderValue): any
    {
        if(child === undefined || child === null)
            return null;
        if(Array.isArray(child))
            return child.map(subChild => this.RenderChild(subChild));

        if(IsRenderElement(child) && child.type === "tr")
        {
            const rowKey = this.input.rowKeys[this.rowCounter];
            const isSelected = this.selection.has(rowKey);

            if(child.properties === null)
                child.properties = {};
            if(isSelected)
                child.properties.className = "table-active";
            child.properties.onclick = this.OnRowClick.bind(this, rowKey);
            child.properties.onselectstart = this.OnStartSelection.bind(this);

            this.rowCounter++;

            return child;
        }

        throw new Error("Children of SelectableTable must be tr-s")
    }

    private RemoveFromSelection(rowKey: RowKeyType)
	{
        this.selection.delete(rowKey);
    }
    
    private SetSelection(rowKey: RowKeyType)
	{
		if((this.selection.size == 1) && this.selection.has(rowKey))
			this.ToggleSelection(rowKey);
		else
		{
			this.ClearSelection();
			this.AddToSelection(rowKey);
		}
	}

    private ToggleSelection(rowKey: RowKeyType)
	{
		if(this.selection.has(rowKey))
			this.RemoveFromSelection(rowKey);
		else
			this.AddToSelection(rowKey);
	}

    //Event handlers
    override OnInitiated()
    {
        this.selection = new Set(this.input.selectedRowKeys);
    }

    override OnInputChanged()
    {
        super.OnInputChanged();

        this.selection = new Set(this.input.selectedRowKeys);
    }

    private OnRowClick(rowKey: RowKeyType, event: MouseEvent)
	{
        event.stopPropagation();

        const rowIndex = this.input.rowKeys.indexOf(rowKey);

		if(event.ctrlKey && this.input.multiSelections)
		{
			//append to selection
			this.ToggleSelection(rowKey);
		}
		else if(event.shiftKey && this.input.multiSelections)
		{
			var min = Number.MAX_VALUE;
			var max = -1;
			for (var key of this.input.selectedRowKeys)
			{
                const idx = this.input.rowKeys.indexOf(key);
				if(idx < min)
					min = idx;
				if(idx > max)
					max = idx;
            }
            
			if(rowIndex < min)
			{
				//add before selection
				for(var i = rowIndex; i < min; i++)
					this.AddToSelection(this.input.rowKeys[i]);
			}
			else if((rowIndex >= min) && (rowIndex <= max))
			{
				//in middle of selection
				if( (rowIndex-min) < (max - rowIndex))
				{
					for(var i = min; i < rowIndex; i++)
						this.RemoveFromSelection(this.input.rowKeys[i]);
				}
				else
				{
					for(var i = rowIndex; i < max; i++)
						this.RemoveFromSelection(this.input.rowKeys[i]);
				}
			}
			else if(rowIndex > max)
			{
				//add after selection
				for(var i = max; i <= rowIndex; i++)
					this.AddToSelection(this.input.rowKeys[i]);
			}
		}
		else
		{
			this.SetSelection(this.input.rowKeys[rowIndex]);
		}
		
		//propagate selection
		var selectedRows = this.input.rowKeys.filter(rowKey => this.selection.has(rowKey));
		this.input.selectionChanged(selectedRows);
    }
    
    private OnStartSelection(event: Event)
    {
        event.preventDefault();
    }
}