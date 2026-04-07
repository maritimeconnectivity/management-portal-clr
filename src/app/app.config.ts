/*
 * Copyright (c) 2025 Maritime Connectivity Platform Consortium
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

import {environment} from '../environments/environment';
import {mpVersion} from './common/version';

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
    static MP_YEAR: string;
    static FOOTER_NAME: string;
    static FOOTER_LINK: string;
    static LOGO_IMG: string;

    public static async _initialize() {
        try {
            const res = await fetch('/assets/config.json');
            const config = await res.json();
            AppConfig.IR_BASE_PATH = config.irBasePath.replace(/\/$/, '');
            AppConfig.SR_BASE_PATH = config.hasServiceRegistry ? config.srBasePath.replace(/\/$/, '') : '';
            AppConfig.ENVIRONMENT_TITLE = config.environmentTitle;
            AppConfig.IDP_NAMESPACE = config.idpNamespace;
            AppConfig.HAS_SERVICE_REGISTRY = config.hasServiceRegistry;
            AppConfig.OIDC_BASE_PATH = config.oidcBasePath.replace(/\/$/, '');
            AppConfig.ENVIRONMENT_NAME = config.environmentName;
            AppConfig.IR_PROVIDER = config.irProvider;
            AppConfig.IR_CONTACT = config.irContact;
            AppConfig.SR_PROVIDER = config.srProvider;
            AppConfig.SR_CONTACT = config.srContact;
            AppConfig.HAS_MSR_LEDGER = config.hasMSRLedger;
            AppConfig.LEDGER_PATH = config.hasMSRLedger ? config.ledgerPath : '';
            AppConfig.MP_PROVIDER = config.mpProvider;
            AppConfig.MP_NAME = config.mpName;
            AppConfig.TERMS_OF_USE = config.termsOfUse;
            AppConfig.MP_CONTACT = config.mpContact;
            AppConfig.MP_VERSION = mpVersion;
            AppConfig.MP_YEAR = config.mpYear;
            AppConfig.FOOTER_NAME = config.footerName;
            AppConfig.FOOTER_LINK = config.footerLink;
            AppConfig.LOGO_IMG = config.logoImg;
        } catch (error) {
            console.log("No config.json could be loaded, falling back to use built in config:", error);
            this.useDefaultConfig();
        }
    }

    private static useDefaultConfig() {
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
        AppConfig.MP_VERSION = mpVersion;
        AppConfig.MP_YEAR = environment.mpYear;
        AppConfig.FOOTER_NAME = environment.footerName;
        AppConfig.FOOTER_LINK = environment.footerLink;
        AppConfig.LOGO_IMG = environment.logoImg;
    }
}
