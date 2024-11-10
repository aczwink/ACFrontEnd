/**
 * ACFrontEnd
 * Copyright (C) 2024 Amir Czwink (amir130@hotmail.de)
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
import { jwtDecode } from "jwt-decode";
import { Anchor, BootstrapIcon, Component, Injectable, JSX_CreateElement, OAuth2TokenManager } from "acfrontend";
import { LayoutManager } from "../services/LayoutManager";

interface OIDC_Claims
{
    email: string;
    given_name: string;
    name: string;
}

@Injectable
export class SessionComponent extends Component
{
    constructor(private oAuth2TokenManager: OAuth2TokenManager, private layoutManager: LayoutManager)
    {
        super();

        this.decodedIdToken = null;
    }

    protected Render(): RenderValue
    {
        if(this.decodedIdToken === null)
            return null;

        const user = this.layoutManager.layout.user;

        return <div className="dropdown">
            <a href="#" className="d-flex align-items-center link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
                <BootstrapIcon>person-circle</BootstrapIcon> {this.decodedIdToken.given_name}
            </a>
            <ul className="dropdown-menu text-small shadow">
                {user.map(x => <li>
                    <Anchor className="dropdown-item" route={"/" + x.routingKey}>
                        <BootstrapIcon>{x.icon}</BootstrapIcon> {x.displayText}
                    </Anchor>
                </li>)}
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="#"><BootstrapIcon>x-octagon-fill</BootstrapIcon> Sign out</a></li>
            </ul>
        </div>;
    }

    //Event handlers
    override OnInitiated(): void
    {
        this.oAuth2TokenManager.tokenIssued.Subscribe(x => this.OnNewTokenIssued(x.idToken));
    }

    private OnNewTokenIssued(idToken?: string)
    {
        if(idToken === undefined)
            return;
        this.decodedIdToken = jwtDecode(idToken);
    }

    //State
    private decodedIdToken: OIDC_Claims | null;
}