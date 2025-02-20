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

export const environment = {
  production: true,
  irBasePath: 'https://api.dmc.international',
  irProvider: 'Digital Maritime Consultancy ApS',
  irContact: 'contact@dmc.international',
  oidcBasePath: 'https://maritimeid.dmc.international',
  hasServiceRegistry: false,
  srBasePath: 'https://msr.dmc.international',
  srProvider: 'Digital Maritime Consultancy ApS',
  srContact: 'contact@dmc.international',
  hasMSRLedger: false,
  ledgerPath: '',
  mpProvider: 'Digital Maritime Consultancy ApS',
  mpContact: 'contact@dmc.international',
  environmentTitle: 'Production',
  termsOfUse: 'By applying for access to the MCP service of Digital Maritime Consultancy ApS, you agree not to store any personal information on the platform such as names and email addresses. Please use generic names, such as \'John Doe\' and generic email addresses such as \'info@company.com\'. It does need to be a working email address though, since access will be granted through this email address. Furthermore, if anyone chooses to federate an identity registry, this should only contain test data - not actual personal information. This is due to the European Union General Data Protection Regulation (GDPR). For more information, contact to contact@dmc.international.',
  idpNamespace: 'dmc',
  environmentName: 'production',
  mpName: 'DMC MCP',
  footerName: 'Digital Maritime Consultancy ApS, 2025',
  footerLink: 'https://dmc.international',
  logoImg: 'assets/images/logo.svg',
};
