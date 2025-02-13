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

/**
 * enum for menu types being used for routing
 */
export enum ItemType {
  None = 'none',
  Device = 'device',
  Organization = 'organization',
  Service = 'service',
  User = 'user',
  Vessel = 'vessel',
  MMS = 'mms',
  Role = 'role',
  Agent = 'agent',
  Instance = 'instance',
  Design = 'design',
  InstanceOfOrg = 'instanceorg',
  OrgCandidate = 'orgcandidate',
  LedgerInstance = 'ledgerInstance',
  Certificate = 'certificate',
  SearchObjectResult = 'searchobjectresult',
}

/**
 * scope of resource type in MIR
 */
export const MIRItemType: string[] = [ ItemType.Device, ItemType.Vessel, ItemType.User,
  ItemType.Service, ItemType.Role, ItemType.Agent ];

export const timestampKeys: string[] = ['start', 'end', 'revokedAt', 'createdAt', 'updatedAt'];

/**
 * enum of MCP entity types. Entity is a subset of resource.
 */
 export enum EntityType {
  Device = 'device',
  Organization = 'organization',
  Service = 'service',
  User = 'user',
  Vessel = 'vessel',
  MMS = 'mms',
}

export enum MrnAttributeInMSR {
  Instance = 'instanceId',
  Design = 'implementsServiceDesign',
}

/**
 * scope of MCP entity types
 */
 export const EntityTypes: string[] = [ EntityType.Device, EntityType.Organization,
  EntityType.Service, EntityType.User, EntityType.Vessel, EntityType.MMS ];

/**
 * readable names for MenuTypes
 */
export const MenuTypeNames = {
  vessel: 'vessel',
  device: 'device',
  user: 'user',
  organization: 'organization',
  service: 'service',
  role: 'role',
  agent: 'agent',
  mms: 'mms',
  instance: 'service instance',
  instanceorg: 'service instance',
  orgcandidate: 'unapproved organization',
  orgsvc: 'owned service',
};

/**
 * icon names for each MenuType
 */
export const MenuTypeIconNames = {
  vessel: 'ship',
  device: 'hdd',
  user: 'user',
  organization: 'flag',
  service: 'cog',
  role: 'id-badge',
  agent: 'user',
  mms: 'forward',
  instance: 'compass',
  instanceorg: 'compass',
  orgcandidate: 'clipboard',
};

export interface InstanceInfo {
  instanceId: string;
  version: string;
  name: string;
}

const capitalize = (s: string): string => s[0].toUpperCase() + s.slice(1);

export const itemTypeToString = (itemType: ItemType): string => {
  if (itemType === ItemType.Instance || itemType === ItemType.SearchObjectResult) {
    return 'Service instance';
  } else if (itemType === ItemType.OrgCandidate) {
    return 'Organization candidate';
  }
  return capitalize(itemType.toString());
}