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

declare const fetch: Function
import {environment} from '../environments/environment';

export class AppConfig {
    static OIDC_BASE_PATH: string;
    static ENDORSEMENT_BASE_PATH: string;
    static IR_BASE_PATH: string;
    static HAS_SERVICE_REGISTRY: boolean;
    static SR_BASE_PATH: string;
    static ENVIRONMENT_TITLE: string;
    static IDP_NAMESPACE: string;
    static ENVIRONMENT_NAME: string;
    static IR_PROVIDER: string;
    static IR_CONTACT: string;
    static SR_PROVIDER: string;
    static SR_CONTACT: string;
    static HAS_MSR_LEDGER: boolean;
    static LEDGER_PATH: string;
    static MP_PROVIDER: string;
    static TERMS_OF_USE: string;
    static MP_CONTACT: string;
    static MP_VERSION: string;
    static MP_NAME: string;
    static FOOTER_NAME: string;
    static FOOTER_LINK: string;
    static LOGO_IMG: string;

    public static _initialize() {
        AppConfig.IR_BASE_PATH = environment.irBasePath.replace(/\/$/, '');
        AppConfig.SR_BASE_PATH = environment.hasServiceRegistry ? environment.srBasePath.replace(/\/$/, '') : '';
        AppConfig.ENVIRONMENT_TITLE = environment.environmentTitle;
        AppConfig.IDP_NAMESPACE = environment.idpNamespace;
        AppConfig.HAS_SERVICE_REGISTRY = environment.hasServiceRegistry;
        AppConfig.OIDC_BASE_PATH = environment.oidcBasePath.replace(/\/$/, '');
        AppConfig.ENVIRONMENT_NAME = environment.environmentName;
        AppConfig.IR_PROVIDER = environment.irProvider;
        AppConfig.IR_CONTACT = environment.irContact;
        AppConfig.SR_PROVIDER = environment.srProvider;
        AppConfig.SR_CONTACT = environment.srContact;
        AppConfig.HAS_MSR_LEDGER = environment.hasMSRLedger;
        AppConfig.LEDGER_PATH = environment.hasMSRLedger ? environment.ledgerPath : '';
        AppConfig.MP_PROVIDER = environment.mpProvider;
        AppConfig.MP_NAME = environment.mpName;
        AppConfig.TERMS_OF_USE = environment.termsOfUse;
        AppConfig.MP_CONTACT = environment.mpContact;
        AppConfig.MP_VERSION = "test";
        AppConfig.FOOTER_NAME = environment.footerName;
        AppConfig.FOOTER_LINK = environment.footerLink;
        AppConfig.LOGO_IMG = environment.logoImg;
    }
}

AppConfig._initialize();
