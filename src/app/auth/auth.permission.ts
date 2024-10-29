/*
 * Copyright (c) 2023 Maritime Connectivity Platform Consortium
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

import { Role } from "../backend-api/identity-registry/model/role";

import RoleNameEnum = Role.RoleNameEnum;

export enum AuthPermission {
    User = 1 << 0,
    OrgAdmin = 1 << 1,
    SiteAdmin = 1 << 2,
    UserAdmin = 1 << 3,
    VesselAdmin = 1 << 4,
    ServiceAdmin = 1 << 5,
    DeviceAdmin = 1 << 6,
    MMSAdmin = 1 << 7,
    ApproveOrg = 1 << 8,
    EntityAdmin = 1 << 9,
}

export enum AuthPermissionForMSR {
  User = 1 << 0,
  OrgServiceAdmin = 1 << 1,
  LedgerAdmin = 1 << 2,
  MSRAdmin = 1 << 3,
}

export const rolesToPermission = (roles: string[]): AuthPermission => {
    let permission = AuthPermission.User;
    for (const roleString of roles) {
      switch (roleString as Role.RoleNameEnum) {
        case RoleNameEnum.ORGADMIN: {
          permission = permission | AuthPermission.OrgAdmin;
          break;
        }
        case RoleNameEnum.SITEADMIN: {
            permission = permission | AuthPermission.SiteAdmin;
          break;
        }
        case RoleNameEnum.USERADMIN: {
            permission = permission | AuthPermission.UserAdmin;
          break;
        }
        case RoleNameEnum.DEVICEADMIN: {
            permission = permission | AuthPermission.DeviceAdmin;
          break;
        }
        case RoleNameEnum.VESSELADMIN: {
            permission = permission | AuthPermission.VesselAdmin;
          break;
        }
        case RoleNameEnum.SERVICEADMIN: {
            permission = permission | AuthPermission.ServiceAdmin;
          break;
        }
        case RoleNameEnum.ENTITYADMIN: {
            permission = permission | AuthPermission.EntityAdmin;
          break;
        }
        case RoleNameEnum.MMSADMIN: {
            permission = permission | AuthPermission.MMSAdmin;
          break;
        }
        case RoleNameEnum.APPROVEORG: {
            permission = permission | AuthPermission.ApproveOrg;
          break;
        }
        default:
          permission = permission | AuthPermission.User;
      }
    }
    return permission;
}

export class PermissionResolver {
    static isSiteAdmin(permission: AuthPermission) {
      return (permission & AuthPermission.SiteAdmin) > 0;
    }
  
    static isOrgAdmin(permission: AuthPermission) {
      return (
        (permission & AuthPermission.OrgAdmin) > 0 || this.isSiteAdmin(permission)
      );
    }
  
    static isEntityAdmin(permission: AuthPermission) {
      return (
        (permission & AuthPermission.EntityAdmin) > 0 ||
        this.isOrgAdmin(permission)
      );
    }
  
    static isUserAdmin(permission: AuthPermission) {
      return (
        (permission & AuthPermission.UserAdmin) > 0 ||
        this.isEntityAdmin(permission)
      );
    }
  
    static isVesselAdmin(permission: AuthPermission) {
      return (
        (permission & AuthPermission.VesselAdmin) > 0 ||
        this.isEntityAdmin(permission)
      );
    }
  
    static isDeviceAdmin(permission: AuthPermission) {
      return (
        (permission & AuthPermission.DeviceAdmin) > 0 ||
        this.isEntityAdmin(permission)
      );
    }
  
    static isServiceAdmin(permission: AuthPermission) {
      return (
        (permission & AuthPermission.ServiceAdmin) > 0 ||
        this.isEntityAdmin(permission)
      );
    }
  
    static canApproveOrg(permission: AuthPermission) {
      return (
        (permission & AuthPermission.ApproveOrg) > 0 ||
        this.isSiteAdmin(permission)
      );
    }

    static isMSRAdmin(roles: string[]) {
      return roles && roles.length > 0 && roles.includes('admin');
    }

    static isLedgerAdmin(roles: string[]) {
      return roles && roles.length > 0 && roles.includes('ledger_admin');
    }

    static isOrgServiceAdmin(roles: string[]) {
      return roles && roles.length > 0 && roles.includes('service_admin');
    }
  }