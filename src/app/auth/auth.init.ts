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
                silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
            }
        });
}

/*

export const initializeKeycloak = (): () => Promise<boolean> => {
    return async () =>
      {
        const keycloak = new Keycloak({
          url: AppConfig.OIDC_BASE_PATH + '/auth/',
          realm: 'MCP',
          clientId: 'MCP-Portal',
        });
        
        try {
            const authenticated = await keycloak.init({
              onLoad: 'check-sso',
              flow: 'standard',
              checkLoginIframe: false,
            }).then((authenticated: any) => {
              AuthService.staticAuthInfo.authz = keycloak;
              AuthService.staticAuthInfo.logoutUrl = "/login";
              if (authenticated) {
                AuthService.staticAuthInfo.loggedIn = true;
      
                AuthService.parseAuthInfo(keycloak.tokenParsed);
      
                keycloak.onAuthLogout = function() {
                  console.log("USER LOGGED OUT");
                  AuthService.handle401();
                };
                keycloak.onTokenExpired = function() {
                  console.log("TOKEN EXPIRED LOGGED OUT");
                };
                  return true;
                } else {
                  AuthService.staticAuthInfo.loggedIn = false;
                  return false;
                }
              }
            );
            console.log(`User is ${authenticated ? 'authenticated' : 'not authenticated'}`);
            return authenticated;
        } catch (error) {
            console.error('Failed to initialize adapter:', error);
        }
      };
  }

  */
