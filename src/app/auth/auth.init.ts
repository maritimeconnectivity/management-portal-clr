/*
 * Copyright (c) 2024 Maritime Connectivity Platform Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AppConfig} from '../app.config';
import {KeycloakService} from 'keycloak-angular';


export const initializeKeycloak = (keycloak: KeycloakService) => {
    return () =>
        keycloak.init({
            config: {
                url: AppConfig.OIDC_BASE_PATH + '/auth/',
                realm: 'MCP',
                clientId: 'MCP-Portal',
            },
            enableBearerInterceptor: true,
            bearerPrefix: 'Bearer',
            initOptions: {
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
                checkLoginIframe: false,
            }
        });
}