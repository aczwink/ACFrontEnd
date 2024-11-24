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

import { Anchor, APIResponse, BootstrapIcon, Component, Injectable, JSX_CreateElement, PopupManager, ProgressSpinner, RouterButton, RouterState } from "acfrontend";
import { Dictionary, EqualsAny, ObjectExtensions, OpenAPI } from "acts-util-core";
import { RenderReadOnlyValue, RenderTitle } from "./ValuePresentation";
import { ReflectiveSchemaCreator } from "../services/ReflectiveSchemaCreator";
import { RouteSetup } from "../domain/declarations";
import { ReplaceRouteParams } from "../Shared";
import { IdBoundObjectAction } from "../domain/IdBoundActions";
import { DeleteAction, EditAction, ObjectBoundAction } from "../domain/ObjectBoundAction";
import { APIResponseHandler } from "../services/APIResponseHandler";
import { ObjectEditorComponent } from "./ObjectEditorComponent";

interface ObjectListInput<T extends object>
{
    baseUrl: string;
    elementSchema?: OpenAPI.ObjectSchema;
    hasChild: boolean;
    heading: string;
    idBoundActions: IdBoundObjectAction<any, any>[];
    id: (keyof T) | ((object: T) => string);
    objectBoundActions: ObjectBoundAction<T, any>[];
    queryDataSource: (routeParams: Dictionary<string>) => Promise<APIResponse<T[]>>;
    unboundActions: RouteSetup<T, any>[];
}

@Injectable
export class ObjectListComponent<T extends object> extends Component<ObjectListInput<T>>
{
    constructor(private reflectiveSchemaCreator: ReflectiveSchemaCreator, private routerState: RouterState, private apiResponseHandler: APIResponseHandler,
        private popupManager: PopupManager
    )
    {
        super();

        this.data = null;
        this.sortKey = "";
        this.sortAscending = false;
    }

    protected Render()
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <div className="container">
            <h1>{this.input.heading}</h1>
            <table className="table table-hover table-striped">
                <thead>
                    <tr>
                        {...this.RenderColumnsNames()}
                        {(this.input.idBoundActions.length + this.input.objectBoundActions.length) == 0 ? null : <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {this.data.map(this.RenderObjectRow.bind(this))}
                </tbody>
            </table>
            {this.input.unboundActions.map(this.RenderUnboundAction.bind(this))}
        </div>;
    }

    //Private methods
    private ExtractId(object: any)
    {
        if(typeof this.input.id === "function")
            return this.input.id(object);
        return object[this.input.id];
    }

    private GetPropertiesOrdered()
    {
        const props = ObjectExtensions.OwnKeys(this.objectSchema.properties).ToArray();
        return props;
    }

    private OrderByDirection(v1: any, v2: any, ascending: boolean)
    {
        if(ascending)
            return this.OrderValue(v1, v2);
        return this.OrderValue(v2, v1);
    }

    private OrderValue(v1: any, v2: any)
    {
        if(typeof v1 === "number")
            return v1 - v2;
        return v1.toString().localeCompare(v2);
    }

    private async QueryData()
    {
        const response = await this.input.queryDataSource(this.routerState.routeParams);
        const result = await this.apiResponseHandler.ExtractDataFromResponseOrShowErrorMessageOnError(response);
        if(!result.ok)
        {
            this.data = [];
            this.objectSchema = {
                type: "object",
                additionalProperties: false,
                properties: {},
                required: [],
            }
            return;
        }
        const data = result.value;

        if(this.input.elementSchema === undefined)
            this.objectSchema = this.reflectiveSchemaCreator.Create(data).items as OpenAPI.ObjectSchema;
        else
            this.objectSchema = this.input.elementSchema;

        this.data = data;

        const firstColumnKey = this.objectSchema.required[0];
        this.Sort(firstColumnKey, true);
    }

    private RenderColumnName(key: string)
    {
        const title = RenderTitle(this.objectSchema.properties[key]!, key.toString());

        let sortIndicator = null;
        if(this.sortKey === key)
        {
            const content = "caret-" + (this.sortAscending ? "down" : "up") + "-fill";
            sortIndicator = <BootstrapIcon>{content}</BootstrapIcon>;
        }

        return <th onclick={this.OnColumnHeaderClick.bind(this, key)} style="cursor: pointer;">{title} {sortIndicator}</th>;
    }

    private RenderColumnsNames()
    {
        const props = this.GetPropertiesOrdered();
        return props.map(x => this.RenderColumnName(x.toString()));
    }

    private RenderIdBoundAction(object: any, action: IdBoundObjectAction<any, any>)
    {
        const route = this.input.baseUrl + "/" + encodeURIComponent(this.ExtractId(object)) + "/" + action.type;
        switch(action.type)
        {
            case "delete":
                return <Anchor className="link-danger" route={this.ReplaceRouteParams(route)}><BootstrapIcon>trash</BootstrapIcon></Anchor>;
        }
    }

    private RenderObjectActions(object: any)
    {
        if((this.input.idBoundActions.length + this.input.objectBoundActions.length) == 0)
            return null;

        return <td>
            {...this.input.objectBoundActions.map(this.RenderObjectBoundAction.bind(this, object))}
            {...this.input.idBoundActions.map(this.RenderIdBoundAction.bind(this, object))}
        </td>;
    }

    private RenderObjectBoundAction(object: any, action: ObjectBoundAction<any, any>)
    {
        switch(action.type)
        {
            case "custom":
                return <a role="button" onclick={() => action.action(this.routerState.routeParams, object)}><BootstrapIcon>{action.icon}</BootstrapIcon></a>;

            case "delete":
                return <a className="link-danger" role="button" onclick={this.OnDelete.bind(this, action, object)}><BootstrapIcon>trash</BootstrapIcon></a>;

            case "edit":
                return <a className="link-primary" role="button" onclick={this.OnEdit.bind(this, action, object)}><BootstrapIcon>pencil</BootstrapIcon></a>;
        }
    }

    private RenderObjectProperty(obj: any, key: string)
    {
        return RenderReadOnlyValue(obj[key], this.objectSchema.properties[key]!);
    }

    private RenderObjectPropertyEntry(obj: any, key: string, idx: number, isRequired: boolean)
    {
        const isIdColumn = (key === this.input.id) || ((idx === 0) && this.input.hasChild);
        if(isIdColumn)
        {
            const id = this.ExtractId(obj);
            const route = this.ReplaceRouteParams(this.input.baseUrl + "/" + encodeURIComponent(id as string));
            return <Anchor route={route}>{this.RenderObjectProperty(obj, key)}</Anchor>;
        }

        if(!isRequired && (obj[key] === undefined))
            return <i>undefined</i>;

        return this.RenderObjectProperty(obj, key);
    }
    
    private RenderObjectRow(entry: T)
    {
        const order = this.GetPropertiesOrdered();
        let entries = order.map( (k, i) => <td>{this.RenderObjectPropertyEntry(entry, k.toString(), i, this.objectSchema.required.Contains(k))}</td>);
        return <tr>{...entries.concat(this.RenderObjectActions(entry))}</tr>;
    }

    private RenderUnboundAction(action: RouteSetup<T, any>)
    {
        const route = this.input.baseUrl + "/" + action.routingKey;
        const replaced = this.ReplaceRouteParams(route);
        return <RouterButton color="primary" route={replaced}><BootstrapIcon>{action.icon}</BootstrapIcon> {action.displayText}</RouterButton>;
    }

    private ReplaceRouteParams(route: string)
    {
        return ReplaceRouteParams(route, this.routerState.routeParams);
    }

    private Sort(columnKey: string | number, ascending: boolean)
    {
        this.sortKey = columnKey;
        this.sortAscending = ascending;

        this.data!.sort((a, b) => this.OrderByDirection((a as any)[columnKey], (b as any)[columnKey], ascending));
    }

    //Event handlers
    private OnColumnHeaderClick(columnKey: string | number)
    {
        const asc = (columnKey === this.sortKey) ? !this.sortAscending : true;
        this.Sort(columnKey, asc);
        this.Update();
    }

    private async OnDelete(action: DeleteAction<T, any>, object: any)
    {
        if(confirm("Are you sure that you want to delete this?"))
        {
            this.data = null;
            await action.deleteResource(this.routerState.routeParams, object);
            this.QueryData();
        }
    }

    private OnEdit(action: EditAction<any, any>, object: object)
    {
        const index = this.data!.findIndex(x => EqualsAny(x, object));
        const clone = ObjectExtensions.DeepClone(object);
        const ref = this.popupManager.OpenDialog(<ObjectEditorComponent object={clone} schema={action.schema} />, { title: "Edit" });
        ref.onAccept.Subscribe( async () => {
            this.data = null;
            ref.Close();

            await action.updateResource(this.routerState.routeParams, clone, object, index);

            this.QueryData();
        });
    }
    
    override OnInitiated(): void
    {
        this.QueryData();
    }

    override OnInputChanged(): void
    {
        this.QueryData();
    }

    //State
    private data: T[] | null;
    private objectSchema!: OpenAPI.ObjectSchema;
    private sortKey: string | number;
    private sortAscending: boolean;
}