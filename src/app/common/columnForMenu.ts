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

import { countryOptions } from './countryOptions';
import { convertTime } from './timeConverter';

/**
 * a json format for both ngx-smart-table and ngx-editable-form articulating how the corresponding interface should work
 */
export const ColumnForResource: {[key: string]: object} = {
  device: {
    id: {
      title: 'ID',
      type: 'number',
      description: 'identifier',
    },
    mrn: {
      title: 'MRN',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      immutable: true,
      required: true,
      shortIdType: 'device',
      error: "Please enter a valid MCP MRN, respecting the format 'urn:mrn:mcp:<entity_type>:<id_provider_id>:<org_id>:<unique_id>'",
    },
    name: {
      title: 'Name',
      type: 'string',
      description: 'Name of device',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    permissions: {
      title: 'Permissions',
      type: 'string',
      description: 'List of permissions assigned by the organization',
      visibleFrom: ['edit', 'detail', 'edit', 'edit-new'],
    },
    mrnSubsidiary: {
      title: 'Subsidiary MRN',
      type: 'string',
      description: 'Additional MRN assigned to entity',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    homeMMSUrl: {
      title: 'Home MMS URL',
      type: 'string',
      description: 'URL of home MMS',
    },
    createdAt: {
      title: 'Created at',
      type: 'string',
      description: 'Time of creation',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail'],
    },
    updatedAt: {
      title: 'Updated at',
      type: 'string',
      description: 'Time of last update',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail', 'list'],
    },
  },
  organization: {
    id: {
      title: 'ID',
      type: 'number',
    },
    logo: {
      title: 'Logo',
      type: 'image',
      allowedExtensions: ['.jpg', '.png'],
      visibleFrom: ['detail', 'edit'],
    },
    mrn: {
      title: 'MRN',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      immutable: true,
      required: true,
      shortIdType: 'organization',
      error: "Please enter a valid MCP MRN, respecting the format 'urn:mrn:mcp:<entity_type>:<id_provider_id>:<org_id>'",
    },
    name: {
      title: 'Name',
      type: 'string',
      description: 'Name of organization',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    mrnSubsidiary: {
      title: 'Subsidiary MRN',
      type: 'string',
      description: 'Additional MRN assigned to entity',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    homeMMSUrl: {
      title: 'Home MMS URL',
      type: 'string',
      description: 'URL of home MMS',
    },
    email: {
      title: 'e-mail',
      type: 'string',
      description: 'Contact e-mail',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
      error: "Please enter a valid email address",
    },
    url: {
      title: 'URL',
      type: 'string',
      description: 'URL of organization',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
      error: "Please enter a valid URL",
    },
    address: {
      title: 'Address',
      type: 'string',
      description: 'Address of organization',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    country: {
      title: 'Country',
      type: 'string',
      description: 'Country that organization belongs to',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      options: countryOptions,
      required: true,
    },
    federationType: {
      title: 'Federation type',
      type: 'string',
      description: 'OpenID Connect federation type',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      immutable: true,
    },
    createdAt: {
      title: 'Created at',
      type: 'string',
      description: 'Time of creation',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail'],
    },
    updatedAt: {
      title: 'Updated at',
      type: 'string',
      description: 'Time of last update',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail', 'list'],
    },
  },
  service: {
    id: {
      title: 'ID',
      type: 'number',
    },
    mrn: {
      title: 'MRN',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      immutable: true,
      required: true,
      shortIdType: 'service',
      error: "Please enter a valid MCP MRN, respecting the format 'urn:mrn:mcp:<entity_type>:<id_provider_id>:<org_id>:<unique_id>'",
    },
    name: {
      title: 'Name',
      type: 'string',
      description: 'Name of service',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    permissions: {
      title: 'Permissions',
      type: 'string',
      description: 'List of permissions assigned by the organization',
      visibleFrom: ['edit', 'detail', 'edit', 'edit-new'],
    },
    mrnSubsidiary: {
      title: 'Subsidiary MRN',
      type: 'string',
      description: 'Additional MRN assigned to entity',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    homeMMSUrl: {
      title: 'Home MMS URL',
      type: 'string',
      description: 'URL of home MMS',
    },
    instanceVersion: {
      title: 'Instance version',
      type: 'string',
      description: 'Version of service instance',
      immutable: true,
    },
    certDomainName: {
      title: 'Certificate domain name',
      type: 'string',
      description: 'The domain name the service will be available on. Used in the issued certificates for the service.',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    oidcClientId: {
      title: 'OIDC client ID',
      type: 'string',
      description: 'OpenID Connect client ID',
      visibleFrom: ['detail', 'edit'],
    },
    oidcClientSecret: {
      title: 'OIDC client secret',
      type: 'string',
      description: 'OpenID Connect client secret',
      visibleFrom: ['detail', 'edit'],
    },
    oidcAccessType: {
      title: 'Access type',
      type: 'string',
      description: 'OpenID Connect access type',
      options: [
        {
          title: 'public',
          value: 'public',
          showField: {
            key: 'oidcRedirectUri',
            value: true,
          },
        },
        {
          title: 'bearer-only',
          value: 'bearer-only',
          showField: {
            key: 'oidcRedirectUri',
            value: false,
          },
        },
        {
          title: 'confidential',
          value: 'confidential',
          showField: {
            key: 'oidcRedirectUri',
            value: true,
          },
        },
      ],
      visibleFrom: ['detail', 'edit'],
    },
    oidcRedirectUri: {
      title: 'OIDC redirect URI',
      type: 'string',
      description: 'OpenID Connect client redirect URI',
      visibleFrom: ['detail', 'edit'],
    },
    vessel: {
      title: 'Vessel',
      type: 'vessel',
      description: 'Correlated vessel',
      visibleFrom: ['detail', 'edit'],
    },
    createdAt: {
      title: 'Created at',
      type: 'string',
      description: 'Time of creation',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail'],
    },
    updatedAt: {
      title: 'Updated at',
      type: 'string',
      description: 'Time of last update',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail', 'list'],
    },
  },
  user: {
    id: {
      title: 'ID',
      type: 'number',
    },
    mrn: {
      title: 'MRN',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      immutable: true,
      required: true,
      shortIdType: 'user',
      error: "Please enter a valid MCP MRN, respecting the format 'urn:mrn:mcp:<entity_type>:<id_provider_id>:<org_id>:<unique_id>'",
    },
    firstName: {
      title: 'First name',
      type: 'string',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    lastName: {
      title: 'Last name',
      type: 'string',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    email: {
      title: 'e-mail',
      type: 'string',
      description: 'Contact e-mail',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      immutable: true,
      required: true,
      error: "Please enter a valid email address",
    },
    permissions: {
      title: 'Permissions',
      type: 'string',
      description: 'List of permissions assigned by the organization',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
    },
    mrnSubsidiary: {
      title: 'Subsidiary MRN',
      type: 'string',
      description: 'Additional MRN assigned to entity',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    homeMMSUrl: {
      title: 'Home MMS URL',
      type: 'string',
      description: 'URL of home MMS',
    },
    createdAt: {
      title: 'Created at',
      type: 'string',
      description: 'Time of creation',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail'],
    },
    updatedAt: {
      title: 'Updated at',
      type: 'string',
      description: 'Time of last update',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail', 'list'],
    },
  },
  vessel: {
    id: {
      title: 'ID',
      type: 'number',
    },
    logo: {
      title: 'Logo',
      type: 'image',
      allowedExtensions: ['.jpg', '.png'],
      visibleFrom: ['detail', 'edit'],
    },
    mrn: {
      title: 'MRN',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      immutable: true,
      required: true,
      shortIdType: 'vessel',
      error: "Please enter a valid MCP MRN, respecting the format 'urn:mrn:mcp:<entity_type>:<id_provider_id>:<org_id>:<unique_id>'",
    },
    name: {
      title: 'Name',
      type: 'string',
      description: 'Name of device',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    permissions: {
      title: 'Permissions',
      type: 'string',
      description: 'List of permissions assigned by the organization',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    // vessel specific
    imoNumber: {
      title: 'IMO number',
      type: 'string',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    mmsiNumber: {
      title: 'MMSI number',
      type: 'string',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    callsign: {
      title: 'Call sign',
      type: 'string',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    flagstate: {
      title: 'Flag state',
      type: 'string',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    aisClass: {
      title: 'AIS class',
      type: 'string',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    portOfRegister: {
      title: 'Port of register',
      type: 'string',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    mrnSubsidiary: {
      title: 'Subsidiary MRN',
      type: 'string',
      description: 'Additional MRN assigned to entity',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    homeMMSUrl: {
      title: 'Home MMS URL',
      type: 'string',
      description: 'URL of home MMS',
    },
    createdAt: {
      title: 'Created at',
      type: 'string',
      description: 'Time of creation',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail'],
    },
    updatedAt: {
      title: 'Updated at',
      type: 'string',
      description: 'Time of last update',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail', 'list'],
    },
  },
  role: {
    id: {
      title: 'ID',
      type: 'number',
    },
    permission: {
      title: 'Permission',
      type: 'string',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    roleName: {
      title: 'Role name',
      type: 'string',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      options: [
        {
          title: 'ROLE_SITE_ADMIN',
          value: 'ROLE_SITE_ADMIN',
        },
        {
          title: 'ROLE_ORG_ADMIN',
          value: 'ROLE_ORG_ADMIN',
        },
        {
          title: 'ROLE_USER',
          value: 'ROLE_USER',
        },
        {
          title: 'ROLE_ENTITY_ADMIN',
          value: 'ROLE_ENTITY_ADMIN',
        },
        {
          title: 'ROLE_USER_ADMIN',
          value: 'ROLE_USER_ADMIN',
        },
        {
          title: 'ROLE_VESSEL_ADMIN',
          value: 'ROLE_VESSEL_ADMIN',
        },
        {
          title: 'ROLE_SERVICE_ADMIN',
          value: 'ROLE_SERVICE_ADMIN',
        },
        {
          title: 'ROLE_APPROVE_ORG',
          value: 'ROLE_APPROVE_ORG',
        },
        {
          title: 'ROLE_DEVICE_ADMIN',
          value: 'ROLE_DEVICE_ADMIN',
        },
        {
          title: 'ROLE_MMS_ADMIN',
          value: 'ROLE_MMS_ADMIN',
        },
      ],
      required: true,
    },
    createdAt: {
      title: 'Created at',
      type: 'string',
      description: 'Time of creation',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail'],
    },
    updatedAt: {
      title: 'Updated at',
      type: 'string',
      description: 'Time of last update',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail', 'list'],
    },
  },
  orgcandidate: {
    id: {
      title: 'ID',
      type: 'number',
    },
    mrn: {
      title: 'MRN',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      shortIdType: 'organization',
      immutable: true,
      required: true,
      error: "Please enter a valid MCP MRN, respecting the format 'urn:mrn:mcp:<entity_type>:<id_provider_id>:<org_id>'",
    },
    name: {
      title: 'Name',
      type: 'string',
      description: 'Name of organization',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    mrnSubsidiary: {
      title: 'Subsidiary MRN',
      type: 'string',
      description: 'Additional MRN assigned to entity',
      visibleFrom: ['detail', 'edit'],
    },
    homeMMSUrl: {
      title: 'Home MMS URL',
      type: 'string',
      description: 'URL of home MMS',
    },
    email: {
      title: 'e-mail',
      type: 'string',
      description: 'Contact e-mail',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
      error: "Please enter a valid email address",
    },
    url: {
      title: 'URL',
      type: 'string',
      description: 'URL of organization',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
      error: "Please enter a valid URL",
    },
    address: {
      title: 'Address',
      type: 'string',
      description: 'Address of organization',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    country: {
      title: 'Country',
      type: 'string',
      description: 'Country that organization belongs to',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      options: countryOptions,
      required: true,
    },
    federationType: {
      title: 'Federation type',
      type: 'string',
      description: 'OpenID Connect federation type',
      visibleFrom: ['detail', 'edit'],
      immutable: true,
    },
    createdAt: {
      title: 'Created at',
      type: 'string',
      description: 'Time of creation',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail'],
    },
    updatedAt: {
      title: 'Updated at',
      type: 'string',
      description: 'Time of last update',
      filter: false,
      valuePrepareFunction: (timestamp: any) => {
        return convertTime(timestamp);
      },
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail', 'list'],
    },
  },
  instance: {
    id: {
      title: 'ID',
      type: 'number',
    },
    instanceId: {
      title: 'Instance ID',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      placeholder: 'urn:mrn:',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    name: {
      title: 'Name',
      type: 'string',
      description: 'Name of service instance',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    version: {
      title: 'Version',
      type: 'string',
      description: 'Version of service instance',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    serviceType: {
      title: 'Service type',
      type: 'stringArray',
      options: [
        {
          title: 'MS 1 - VTS Information service (INS)',
          value: 'VTSInformationService',
        },
        {
          title: 'MS 2 - VTS Navigational assistance service (NAS)',
          value: 'VTSNavigationalAssistanceService',
        },
        {
          title: 'MS 3 - Traffic organization service (TOS)',
          value: 'TrafficOrganizationService',
        },
        {
          title: 'MS 4 - Port support service (PSS)',
          value: 'PortSupportService',
        },
        {
          title: 'MS 5 - Maritime safety information (MSI) service',
          value: 'MaritimeSafetyInformationService',
        },
        {
          title: 'MS 6 - Pilotage service',
          value: 'PilotageService',
        },
        {
          title: 'MS 7 - Tug service',
          value: 'TugService',
        },
        {
          title: 'MS 8 - Vessel shore reporting',
          value: 'VesselShoreReporting',
        },
        {
          title: 'MS 9 - Telemedical assistance service (TMAS)',
          value: 'TelemedicalAssistanceService',
        },
        {
          title: 'MS 10 - Maritime assistance service (MAS)',
          value: 'MaritimeAssistanceService',
        },
        {
          title: 'MS 11 - Nautical chart service',
          value: 'NauticalChartService',
        },
        {
          title: 'MS 12 - Nautical publications service',
          value: 'NauticalPublicationsService',
        },
        {
          title: 'MS 13 - Ice navigation service',
          value: 'IceNavigationService',
        },
        {
          title: 'MS 14 - Meteorological information service',
          value: 'MeteorologicalInformationService',
        },
        {
          title: 'MS 15 - Real-time hydrographic and environmental information services',
          value: 'RealTimeHydrographicAndEnvironmentalInformationServices',
        },
        {
          title: 'MS 16 - Search and rescue (SAR) service',
          value: 'SearchAndRescueService',
        },
        {
          title: 'Other',
          value: 'other:etc',
        },
      ],
      description: 'The service type shall reflect the associated operational service type provided according to defined types',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
    },
    dataProductType: {
      title: 'Data product type',
      type: 'stringArray',
      options: [
        {
          title: 'S-57 Electronic Navigational Chart (ENC)',
          value: 'S57',
        },
        {
          title: 'S-101 Electronic Navigational Chart (ENC)',
          value: 'S101',
        },
        {
          title: 'S-102 Bathymetric Surface',
          value: 'S102',
        },
        {
          title: 'S-104 Water Level Information for Surface Navigation',
          value: 'S104',
        },
        {
          title: 'S-111 Surface Currents',
          value: 'S111',
        },
        {
          title: 'S-122 Marine Protected Areas (MPAs)',
          value: 'S122',
        },
        {
          title: 'S-123 Marine Radio Services',
          value: 'S123',
        },
        {
          title: 'S-124 Navigational Warnings',
          value: 'S124',
        },
        {
          title: 'S-125 Marine Navigational Services',
          value: 'S125',
        },
        {
          title: 'S-126 Marine Physical Environment',
          value: 'S126',
        },
        {
          title: 'S-127 Marine Traffic Management',
          value: 'S127',
        },
        {
          title: 'S-128 Catalogue of Nautical Products',
          value: 'S128',
        },
        {
          title: 'S-129 Under Keel Clearance Management (UKCM)',
          value: 'S129',
        },
        {
          title: 'S-131 Marine Harbour Infrastructure',
          value: 'S131',
        },
        {
          title: 'S-210 Inter-VTS Exchange Format',
          value: 'S210',
        },
        {
          title: 'S-211 Port Call Message Format',
          value: 'S211',
        },
        {
          title: 'S-212 VTS Digital Information Service',
          value: 'S212',
        },
        {
          title: 'S-401 Inland ENC',
          value: 'S401',
        },
        {
          title: 'S-402 Bathymetric Contour Overlay for Inland ENC',
          value: 'S402',
        },
        {
          title: 'S-411 Sea Ice Information',
          value: 'S411',
        },
        {
          title: 'S-412 Weather Overlay',
          value: 'S412',
        },
        {
          title: 'S-413 Marine Weather Conditions',
          value: 'S413',
        },
        {
          title: 'S-414 Marine Weather Observations',
          value: 'S414',
        },
        {
          title: 'S-421 Route Plan',
          value: 'S421',
        },
        {
          title: 'Route Plan',
          value: 'RTZ',
        },
        {
          title: 'Electronic Port Clearance',
          value: 'EPC',
        },
        {
          title: 'Other data types not covered in this table',
          value: 'OTHER',
        },
      ],
      description: 'Data product type defined in IEC 63173-2 SECOM standard',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
    },
    status: {
      title: 'Status',
      type: 'string',
      options: [
        {
          title: 'Provisional',
          value: 'PROVISIONAL',
        },
        {
          title: 'Released',
          value: 'RELEASED',
        },
        {
          title: 'Deprecated',
          value: 'DEPRECATED',
        },
        {
          title: 'Deleted',
          value: 'DELETED',
        },
      ],
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
      required: true,
    },
    endpointUri: {
      title: 'Endpoint URI',
      type: 'string',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    endpointType: {
      title: 'Endpoint type',
      type: 'string',
      visibleFrom: [],
    },
    organizationId: {
      title: 'Organization ID',
      type: 'string',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      immutable: true,
    },
    keywords: {
      title: 'Keywords',
      type: 'stringArray',
      placeholder: 'Please enter keyword',
      visibleFrom: ['detail', 'list', 'edit', 'edit-new'],
    },
    implementsServiceDesign: {
      title: 'Technical design ID',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      placeholder: 'urn:mrn:',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    implementsServiceDesignVersion: {
      title: 'Technical design version',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    comment: {
      title: 'Comment',
      type: 'string',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    geometryContentType: {
      title: 'Geometry content type',
      type: 'string',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    geometry: {
      title: 'Geometry',
      type: 'object',
      visibleFrom: [],
    },
    unlocode: {
      title: 'Unlocode',
      type: 'string',
      placeholder: 'Please enter UN/LOCODE',
      visibleFrom: [],
    },
    mmsi: {
      title: 'MMSI',
      type: 'string',
      visibleFrom: [],
    },
    imo: {
      title: 'IMO number',
      type: 'string',
      visibleFrom: [],
    },
    instanceAsXml: {
      title: 'Instance as XML',
      type: 'file',
      notShowOnEdit: true,
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    instanceAsDocId: {
      title: 'Instance as DocId',
      type: 'number',
    },
    instanceAsDoc: {
      title: 'Instance as document',
      type: 'file',
      visibleFrom: ['detail', 'edit', 'edit-new'],
    },
    ledgerRequestId: {
      title: 'Ledger Request ID',
      type: 'number',
    },
    ledgerRequestStatus: {
      title: 'Ledger Request status',
      type: 'string',
      options: [
        {
          title: 'Inactive',
          value: 'INACTIVE',
        },
        {
          title: 'Created',
          value: 'CREATED',
        },
        {
          title: 'Vetting',
          value: 'VETTING',
        },
        {
          title: 'Vetted',
          value: 'VETTED',
        },
        {
          title: 'Requesting',
          value: 'REQUESTING',
        },
        {
          title: 'Succeeded',
          value: 'SUCCEEDED',
        },
        {
          title: 'Failed',
          value: 'FAILED',
        },
        {
          title: 'Rejected',
          value: 'REJECTED',
        },
      ],
      visibleFrom: [],
    },
    docIds: {
      title: 'Related documents',
      type: 'fileArray',
      filter: false,
      visibleFrom: [],
    },
    publishedAt: {
      title: 'Created at',
      type: 'string',
      description: 'Time of creation',
      filter: false,
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: [],
    },
    lastUpdatedAt: {
      title: 'Updated at',
      type: 'string',
      description: 'Time of last update',
      filter: false,
      immutable: true,
      notShowOnEdit: true,
      visibleFrom: ['detail'],
    },
  },
  newOrganization: {
    orgMrn: {
      title: 'Maritime Resource Name (MRN) for organization',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
      shortIdType: 'organization',
    },
    orgName: {
      title: 'Organization name',
      type: 'string',
      description: 'Name of organization',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    orgEmail: {
      title: 'Organization contact e-mail',
      type: 'string',
      description: 'Contact e-mail',
      placeholder: 'non-personal email, e.g., info@example.org',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    orgUrl: {
      title: 'URL of organization',
      type: 'string',
      description: 'URL of organization',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    orgAddress: {
      title: 'Address of organization',
      type: 'string',
      description: 'Address of organization',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      required: true,
    },
    orgCountry: {
      title: 'Country of organization',
      type: 'stringArray',
      description: 'Country that organization belongs to',
      visibleFrom: ['detail', 'edit', 'edit-new'],
      options: countryOptions,
      required: true,
    },
  },
  ledgerInstance: {
    name: {
      title: 'Name',
      type: 'string',
      description: 'Name of service instance',
      visibleFrom: ['list'],
    },
    mrn: {
      title: 'MRN',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['list'],
    },
    version: {
      title: 'Version',
      type: 'string',
      description: 'Version of service instance',
      visibleFrom: ['list'],
    },
    keywords: {
      title: 'Keywords',
      type: 'string',
      visibleFrom: ['list'],
    },
    coverageArea: {
      title: 'Coverage ',
      type: 'string',
    },
    status: {
      title: 'Status',
      type: 'string',
      options: [
        {
          title: 'Provisional',
          value: 'PROVISIONAL',
        },
        {
          title: 'Released',
          value: 'RELEASED',
        },
        {
          title: 'Deprecated',
          value: 'DEPRECATED',
        },
        {
          title: 'Deleted',
          value: 'DELETED',
        },
      ],
      visibleFrom: ['list'],
    },
    implementsDesignMRN: {
      title: 'Technical design ID',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['list'],
      shortIdType: 'design',
      immutable: true,
    },
    implementsDesignVersion: {
      title: 'Technical design version',
      type: 'string',
      description: 'MCP MRN as unique identifer',
      visibleFrom: ['list'],
    },
    msrName: {
      title: 'MSR Name of register',
      type: 'string',
      visibleFrom: ['list'],
    },
    msrUrl: {
      title: 'MSR URL of register',
      type: 'string',
      visibleFrom: ['list'],
    },
  },
};
