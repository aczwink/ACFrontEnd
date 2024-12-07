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

import { Injectable, JSX_CreateElement, OAuth2Guard, OAuth2LoginRedirectHandler, OAuth2LogoutHandler, RootInjector, Route, Router, Routes } from "acfrontend";
import { CollectionContentSetup, ComponentContentSetup, CreateContentSetup, ElementViewModel, ListContentSetup, MultiPageContentSetup, ObjectContentSetup, RouteSetup, RoutingViewModel } from "../domain/declarations";
import { ObjectListComponent } from "../components/ObjectListComponent";
import { FeaturesManager } from "./FeaturesManager";
import { CreateObjectComponent } from "../components/CreateObjectComponent";
import { ViewObjectComponent } from "../components/ViewObjectComponent";
import { IdBoundObjectAction } from "../domain/IdBoundActions";
import { DeleteObjectComponent } from "../components/DeleteObjectComponent";
import { MultiPageNavComponent } from "../components/MultiPageNavComponent";
import { Dictionary, ObjectExtensions, OpenAPI } from "acts-util-core";
import { ReplaceRouteParams } from "../Shared";
import { EditObjectComponent } from "../components/EditObjectComponent";
import { DelayedStaticContentComponent } from "../components/DelayedStaticContentComponent";
import { NamedSchemaRegistry } from "./NamedSchemaRegistry";

class PathTraceNode
{
    constructor()
    {
        this.segment = "";
        this._parent = null;
    }

    //Properties
    public get parent(): PathTraceNode
    {
        if(this._parent === null)
            return this;
        return this._parent;
    }

    public get path(): string
    {
        if(this._parent === null)
            return "/";
        return this.JoinRoute(this._parent.path, this.segment);
    }

    //Public methods
    public CreateChild(segment: string)
    {
        const child = new PathTraceNode;
        child.segment = segment;
        child._parent = this;

        return child;
    }

    //Private state
    private segment: string;
    private _parent: PathTraceNode | null;

    //Private methods
    private JoinRoute(base: string, segmentToAdd: string)
    {
        if(base === "/")
            return base + segmentToAdd;
        return base + "/" + segmentToAdd;
    }
}

@Injectable
export class RoutingManager
{
    constructor(private featuresManager: FeaturesManager, private namedSchemaRegistry: NamedSchemaRegistry)
    {
        this.rootRoutes = [];
    }

    //Public methods
    public BuildAppRoutes(): Routes
    {
        const rootRoutes: Routes = this.rootRoutes.map(x => this.BuildRoutesFromSetup(x, new PathTraceNode));

        const oAuth2Routes: Routes = [
            { path: "oauth2loggedin", component: <OAuth2LoginRedirectHandler /> },
            { path: "oauth2loggedout", component: <OAuth2LogoutHandler config={this.featuresManager.oAuth2Config} /> },
        ];

        const staticRoutes: Routes = [
            { path: "accessdenied", component: <div className="container text-center">
                <h1>Access denied!</h1>
            </div>},
            { path: "", redirect: rootRoutes[0].path },
            { path: "*", component: <div className="container text-center">
                <h1>404</h1>
            </div>},
        ];

        return rootRoutes.concat(oAuth2Routes, staticRoutes);
    }

    public BuildURL(routeSetup: RouteSetup<any, any>, routeParams: Dictionary<string>)
    {
        const pathTrace = this.rootRoutes.Values().Map(x => this.FindRouteSetup(x, routeSetup, new PathTraceNode)).NotUndefined().First();
        return ReplaceRouteParams(pathTrace.path, routeParams);
    }

    public RegisterRootRouteSetup(routeSetup: RouteSetup<any, any>): void
    {
        this.rootRoutes.push(routeSetup);
    }

    //Private methods
    private BuildBoundActionComponent(action: IdBoundObjectAction<any, any>, formTitle: (ids: any, object: any) => string, parentNode: PathTraceNode)
    {
        switch(action.type)
        {
            case "custom_edit":
                return <EditObjectComponent
                    formTitle={formTitle}
                    loadContext={action.loadContext}
                    postUpdateUrl={parentNode.parent.path}
                    requestObject={async ids => (await action.requestObject(ids))}
                    updateResource={(ids, obj) => action.updateResource(ids, obj)}
                    schema={action.schema}
                    />;
                    
            case "edit":
                return <EditObjectComponent
                    formTitle={formTitle}
                    loadContext={action.loadContext}
                    postUpdateUrl={parentNode.parent.path}
                    requestObject={async ids => (await action.requestObject(ids))}
                    schema={action.schema}
                    updateResource={(ids, obj) => action.updateResource(ids, obj)}
                    />;

            case "delete":
                return <DeleteObjectComponent
                    abortURL={parentNode.path}
                    deleteResource={ids => action.deleteResource(ids)}
                    postDeleteUrl={parentNode.parent.path}
                    />;
        }
    }

    private BuildBoundActionRoute(action: IdBoundObjectAction<any, any>, formTitle: (ids: any, object: any) => string, parentNode: PathTraceNode): Route
    {
        return {
            component: this.BuildBoundActionComponent(action, formTitle, parentNode),
            path: (action.type === "custom_edit" ? action.key : action.type)
        };
    }

    private BuildCollectionRoutesFromSetup(routeSetup: RouteSetup<any, any>, content: CollectionContentSetup<any, any>, parentNode: PathTraceNode): Route
    {
        const actions = content.actions ?? [];
        const dataSource = content;

        const ownNode = parentNode.CreateChild(routeSetup.routingKey);
        const childRoute = this.BuildRoutesFromSetup(content.child, ownNode);

        return {
            children: [
                ...actions.map(x => this.BuildRoutesFromSetup(x, ownNode)),
                childRoute,
                {
                    component: <ObjectListComponent<any>
                        baseUrl={ownNode.path}
                        elementSchema={dataSource.schema}
                        hasChild={true}
                        heading={routeSetup.displayText}
                        idBoundActions={this.FindActions(content.child)}
                        id={dataSource.id}
                        objectBoundActions={[]}
                        queryDataSource={routeParams => dataSource.requestObjects(routeParams)}
                        unboundActions={actions}
                    />,
                    path: "",
                }
            ],
            guards: this.CreateRouteGuards(routeSetup),
            path: routeSetup.routingKey,
        };
    }

    private BuildComponentRoutesFromSetup(routeSetup: RouteSetup<any, any>, viewModel: ComponentContentSetup): Route
    {
        return {
            component: viewModel.component,
            guards: this.CreateRouteGuards(routeSetup),
            path: routeSetup.routingKey,
        };
    }

    private BuildCreateRoutesFromSetup(routeSetup: RouteSetup<any, any>, content: CreateContentSetup<any, any>, parentNode: PathTraceNode): Route
    {
        return {
            component: <CreateObjectComponent
                createResource={content.call}
                heading={routeSetup.displayText}
                loadContext={(content.loadContext === undefined) ? undefined : (ids => content.loadContext!(ids))}
                postCreationURL={parentNode.path}
                schema={content.schema} />,
            guards: this.CreateRouteGuards(routeSetup),
            path: routeSetup.routingKey,
        };
    }

    private BuildElementRoutesFromSetup(routeSetup: RouteSetup<any, any>, viewModel: ElementViewModel<any>): Route
    {
        return {
            component: <DelayedStaticContentComponent contentLoader={() => viewModel.element(RootInjector.Resolve(Router).state.Get().routeParams)} />,
            guards: this.CreateRouteGuards(routeSetup),
            path: routeSetup.routingKey,
        }
    }

    private BuildListRoutesFromSetup(routeSetup: RouteSetup<any, any>, content: ListContentSetup<any, any>, parentNode: PathTraceNode): Route
    {
        const actions = content.actions ?? [];
        const schema = content.schema;

        let mappedSchema;
        if((schema !== undefined) && ("oneOf" in schema))
        {
            function Combine(a: Dictionary<OpenAPI.Schema | OpenAPI.Reference>, b: Dictionary<OpenAPI.Schema | OpenAPI.Reference>): Dictionary<OpenAPI.Schema | OpenAPI.Reference>
            {
                const aOnly = ObjectExtensions.OwnKeys(a).Filter(k => !(k in b));
                const bOnly = ObjectExtensions.OwnKeys(b).Filter(k => !(k in a));
                const both = ObjectExtensions.OwnKeys(a).ToSet().Without(aOnly.ToSet());

                const dict = aOnly.ToDictionary(k => k, k => a[k]!);
                bOnly.ForEach(k => dict[k] = b[k]);
                both.forEach(k => dict[k] = a[k]); //TODO: should create union type

                return dict;
            }

            const schemas = schema.oneOf.map(x => this.namedSchemaRegistry.ResolveSchemaOrReference(x)) as OpenAPI.ObjectSchema[];
            const intersection: OpenAPI.ObjectSchema = {
                additionalProperties: false,
                properties: schemas.Values().Map( x => x.properties).Accumulate(Combine),
                required: schemas.Values().Map(x => x.required.Values().ToSet()).Accumulate( (x, y) => x.Intersect(y) ).ToArray(),
                type: "object",
            };
            mappedSchema = intersection;
        }
        else
            mappedSchema = schema as OpenAPI.ObjectSchema;

        const ownNode = parentNode.CreateChild(routeSetup.routingKey);
        return {
            children: [
                ...actions.map(action => this.BuildRoutesFromSetup(action, ownNode)),
                {
                    component: <ObjectListComponent
                        baseUrl={ownNode.path}
                        hasChild={false}
                        heading={routeSetup.displayText}
                        idBoundActions={[]}
                        id={""} //for lists we don't want to show links to child objects
                        objectBoundActions={content.boundActions ?? []}
                        queryDataSource={routeParams => content.requestObjects(routeParams)}
                        unboundActions={actions}
                        elementSchema={mappedSchema}
                        />,
                    path: ""
                }
            ],
            guards: this.CreateRouteGuards(routeSetup),
            path: routeSetup.routingKey,
        }
    }

    private BuildMultiPageRoutesFromSetup(routeSetup: RouteSetup<any>, content: MultiPageContentSetup<any>, parentNode: PathTraceNode): Route
    {
        if(content.entries.length === 0)
        {
            return {
                path: "",
            };
        }

        const cats = content.entries.map(x => (
            {
                catName: x.displayName,
                objectTypes: x.entries.map(y => (
                    {
                        key: y.routingKey,
                        displayName: y.displayText,
                        icon: y.icon
                    }
                ))
            }
        ));

        const ownNode = parentNode.CreateChild(routeSetup.routingKey);

        return {
            children: [
                ...content.actions.map(action => this.BuildBoundActionRoute(action, content.formTitle, ownNode)),
                ...content.entries.Values().Map(x => x.entries.Values()).Flatten().Map(x => this.BuildRoutesFromSetup(x, ownNode)).ToArray(),
                {
                    path: "",
                    redirect: content.entries[0].entries[0].routingKey
                }
            ],
            component: <MultiPageNavComponent actions={content.actions} baseRoute={ownNode.path} formHeading={content.formTitle} cats={cats} />,
            guards: this.CreateRouteGuards(routeSetup),
            path: routeSetup.routingKey,
        };
    }

    private BuildObjectRoutesFromSetup(routeSetup: RouteSetup<any, any>, content: ObjectContentSetup<any, any>, parentNode: PathTraceNode): Route
    {
        const ownNode = parentNode.CreateChild(routeSetup.routingKey);

        return {
            children: [
                ...content.actions.map(action => this.BuildBoundActionRoute(action, content.formTitle, parentNode)),
                {
                    component: <ViewObjectComponent
                        actions={content.actions}
                        baseRoute={ownNode.path}
                        heading={content.formTitle}
                        requestObject={routeParams => content.requestObject(routeParams)}
                        schema={content.schema}
                        />,
                    path: ""
                }
            ],
            guards: this.CreateRouteGuards(routeSetup),
            path: routeSetup.routingKey,
        };
    }

    private BuildRoutingViewModelRoutes(routeSetup: RouteSetup<any, any>, content: RoutingViewModel, parentNode: PathTraceNode): Route
    {
        const ownNode = parentNode.CreateChild(routeSetup.routingKey);
        return {
            children: content.entries.map(x => this.BuildRoutesFromSetup(x, ownNode)),
            guards: this.CreateRouteGuards(routeSetup),
            path: routeSetup.routingKey,
        }
    }

    private BuildRoutesFromSetup(routeSetup: RouteSetup<any, any>, parentNode: PathTraceNode): Route
    {
        switch(routeSetup.content.type)
        {
            case "collection":
                return this.BuildCollectionRoutesFromSetup(routeSetup, routeSetup.content, parentNode);

            case "component":
                return this.BuildComponentRoutesFromSetup(routeSetup, routeSetup.content);

            case "create":
                return this.BuildCreateRoutesFromSetup(routeSetup, routeSetup.content, parentNode);

            case "element":
                return this.BuildElementRoutesFromSetup(routeSetup, routeSetup.content);

            case "list":
                return this.BuildListRoutesFromSetup(routeSetup, routeSetup.content, parentNode);

            case "multiPage":
                return this.BuildMultiPageRoutesFromSetup(routeSetup, routeSetup.content, parentNode);

            case "object":
                return this.BuildObjectRoutesFromSetup(routeSetup, routeSetup.content, parentNode);
                
            case "routing":
                return this.BuildRoutingViewModelRoutes(routeSetup, routeSetup.content, parentNode);
        }
    }

    private CreateOAuth2RouteGuard(routeSetup: RouteSetup<any, any>)
    {
        if(routeSetup.requiredScopes === undefined)
            return undefined;

        const oidcScopes = ["openid", "email", "profile"];
        const scopes = this.featuresManager.OIDC ? routeSetup.requiredScopes.concat(oidcScopes) : routeSetup.requiredScopes;
        return [
            new OAuth2Guard({ config: this.featuresManager.oAuth2Config, scopes })
        ];
    }

    private CreateRouteGuards(routeSetup: RouteSetup<any, any>)
    {
        const oAuth2Guard = this.CreateOAuth2RouteGuard(routeSetup);
        if(routeSetup.guards === undefined)
            return oAuth2Guard;
        if(oAuth2Guard === undefined)
            return routeSetup.guards;
        return routeSetup.guards.concat(oAuth2Guard);
    }

    private FindActions(routeSetup: RouteSetup<any, any>)
    {
        switch(routeSetup.content.type)
        {
            case "collection":
            case "component":
            case "create":
            case "element":
            case "list":
            case "routing":
                return [];
            case "multiPage":
                return routeSetup.content.actions;
            case "object":
                return routeSetup.content.actions;
        }
    }

    private FindRouteSetup(searchIn: RouteSetup<any, any>, searchFor: RouteSetup<any, any>, pathTrace: PathTraceNode): PathTraceNode | undefined
    {
        const ownNode = pathTrace.CreateChild(searchIn.routingKey);
        if(searchFor === searchIn)
            return ownNode;

        switch(searchIn.content.type)
        {
            case "collection":
                //TODO: searchIn.content.actions
                return this.FindRouteSetup(searchIn.content.child, searchFor, ownNode);
            case "create":
                return undefined;
            case "multiPage":
                //TODO: searchIn.content.actions
                //TODO: searchIn.content.entries
                return undefined;
            case "object":
                //TODO: searchIn.content.actions
                return undefined;
            default:
                throw new Error(searchIn.content.type);
        }
    }

    //State
    private rootRoutes: RouteSetup<any, any>[];
}