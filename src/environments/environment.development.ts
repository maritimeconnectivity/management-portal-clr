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
  production: false,
  irBasePath: 'https://test-api.maritimeconnectivity.net',
  irProvider: 'MCP Consortium',
  irContact: 'info@maritimeconnectivity.net',
  oidcBasePath: 'https://test-maritimeid.maritimeconnectivity.net',
  hasServiceRegistry: true,
  srBasePath: 'https://msr-test.maritimeconnectivity.net',
  srProvider: 'MCP Consortium',
  srContact: 'info@maritimeconnectivity.net',
  hasMSRLedger: false,
  ledgerPath: 'https://test-ledger.maritimeconnectivity.net',
  mpProvider: 'MCP Consortium',
  mpContact: 'info@maritimeconnectivity.net',
  environmentTitle: 'MCC Testbed TEST',
  termsOfUse: 'By applying for access to the MCP testbed, you agree not to store any personal information on the platform such as names and email addresses. Please use generic names, such as \'John Doe\' and generic email addresses such as \'info@company.com\'. It does need to be a working email address though, since access will be granted through this email address. Furthermore, if anyone chooses to federate an identity registry into the MCP testbed, this should only contain test data - not actual personal information. This is due to the European Union General Data Protection Regulation (GDPR). For more information, contact the MCC secretariat.',
  idpNamespace: 'mcc-test',
  environmentName: 'test',
  mpName: 'MCC MCP Testbed',
  mpYear: '2025',
  footerName: 'Maritime Connectivity Platform Consortium',
  footerLink: 'https://maritimeconnectivity.net',
  logoImg: 'assets/images/logo.svg',
};
