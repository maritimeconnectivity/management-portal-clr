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

import { Injectable } from '@angular/core';
import { ItemType } from '../menuType';
import { firstValueFrom, Observable } from 'rxjs';
import { Device, DeviceControllerService, Organization, OrganizationControllerService, Role, RoleControllerService, Service, ServiceControllerService, ServicePatch, User, UserControllerService, Vessel, VesselControllerService } from 'src/app/backend-api/identity-registry';
import { preprocess } from '../itemPreprocessor';
import { InstanceControllerService, InstanceDto, XmlControllerService, XmlDto } from 'src/app/backend-api/service-registry';
import { FetchedItems } from '../fetchedItems';
import {SearchFilterObject, SearchObjectResult, SearchParameters, SECOMService} from 'src/app/backend-api/secom';

import RoleNameEnum = Role.RoleNameEnum;
@Injectable({
  providedIn: 'root'
})
export class ItemManagerService {
  private rolesInOrg : RoleNameEnum[] = [];

  constructor(
    private deviceService: DeviceControllerService,
    private organizationService: OrganizationControllerService,
    private userService: UserControllerService,
    private serviceService: ServiceControllerService,
    private vesselService: VesselControllerService,
    private roleService: RoleControllerService,
    private instanceService: InstanceControllerService,
    private secomService: SECOMService,
    private xmlService: XmlControllerService,
  ) { }

  fetchListOfData = async (itemType: ItemType, orgMrn: string, pageNumber: number, elementsPerPage: number, secomSearchFilterobj?: SearchFilterObject, xactId? : string): Promise<FetchedItems> => {
    let page;

    if(itemType === ItemType.Instance) {
      page = await firstValueFrom(this.instanceService.getInstances(pageNumber, elementsPerPage, [], 'response'));
      const totalElements = parseInt(page.headers.get('X-Total-Count')!) || 0;
      return { data: (page.body! as InstanceDto[]).map(i => preprocess(i, itemType)),
        totalPages: Math.ceil( totalElements / elementsPerPage),
        totalElements};


    } else if(itemType === ItemType.SearchObjectResult && secomSearchFilterobj) {

      page = await firstValueFrom(this.secomService.search(secomSearchFilterobj, 'response'));

      const newXactId = page.body?.transactionId ?? undefined;


      const totalElements = parseInt(page.headers.get('X-Total-Count')!) || 10;

      console.log("Total elements from header: ", page.body?.services!.length);

      return { data: (page.body?.services! as SearchObjectResult[]).map(i => preprocess(i, itemType)),
        totalPages: Math.ceil( totalElements / elementsPerPage),
        totalElements, transactionId : newXactId};

      // Case: we want to call retrievereults with xactId only
    } else if(itemType === ItemType.SearchObjectResult && xactId) {
      page = await firstValueFrom(
          this.secomService.v2RetrieveResultsTransactionIdGet(xactId, 'response')
      );

      const services = (page.body?.services ?? []) as SearchObjectResult[];

      const totalHeader = page.headers.get('X-Total-Count');
      const totalElements =
          (totalHeader ? parseInt(totalHeader, 10) : services.length) || 0;

      return {
        data: services.map(i => preprocess(i, itemType)),
        totalPages: Math.ceil(totalElements / elementsPerPage || 1),
        totalElements,
      };


    } else if (itemType === ItemType.Device) {
      page = await firstValueFrom(this.deviceService.getOrganizationDevices(orgMrn, pageNumber, elementsPerPage));
    } else if(itemType === ItemType.Organization) {
      page = await firstValueFrom(this.organizationService.getOrganization(pageNumber, elementsPerPage));
    } else if(itemType === ItemType.User) {
      page = await firstValueFrom(this.userService.getOrganizationUsers(orgMrn, pageNumber, elementsPerPage));
    } else if(itemType === ItemType.Service) {
      page = await firstValueFrom(this.serviceService.getOrganizationServices(orgMrn, pageNumber, elementsPerPage));
    } else if(itemType === ItemType.Vessel) {
      page = await firstValueFrom(this.vesselService.getOrganizationVessels(orgMrn, pageNumber, elementsPerPage));
    } else if(itemType === ItemType.OrgCandidate) {
      page = await firstValueFrom(this.organizationService.getUnapprovedOrganizations(pageNumber, elementsPerPage));
    } else {
      throw new Error('Invalid entity type');
    }
    return {
      data: Array.isArray(page) ?
        page.map(i => preprocess(i, itemType)) :
        page.content!.map(i => preprocess(i, itemType)),
      totalPages: page.totalPages!,
      totalElements: page.totalElements!};
  }

  fetchAllRolesInOrg = async (orgMrn: string) => {
    return await firstValueFrom(this.roleService.getRoles(orgMrn));
  }

  fetchMyRolesInOrg = async (orgMrn: string) => {
    if (this.rolesInOrg.length === 0) {
      const roles = await firstValueFrom(this.roleService.getMyRole(orgMrn));
      this.rolesInOrg = roles.map(role => role as RoleNameEnum);
    }
    return this.rolesInOrg;
  }

  clearRolesContext = () => {
    this.rolesInOrg = [];
  }

  fetchSingleData = async (itemType: ItemType, orgMrn: string, id: string, instanceVersion?: string): Promise<any | undefined> => {
    try {
      let item;
      if (itemType === ItemType.Device) {
        item = await firstValueFrom(this.deviceService.getDevice(orgMrn, id));
      } else if (itemType === ItemType.Organization) {
        item = await firstValueFrom(this.organizationService.getOrganization1(id));
      } else if (itemType === ItemType.User) {
        item = await firstValueFrom(this.userService.getUser(orgMrn, id));
      } else if (itemType === ItemType.Service) {
        if (instanceVersion && instanceVersion.length > 0) {
          item = await firstValueFrom(this.serviceService.getServiceVersion(orgMrn, id, instanceVersion));
        } else {
          item = await firstValueFrom(this.serviceService.getService(orgMrn, id));
        }
      } else if (itemType === ItemType.Vessel) {
        item = await firstValueFrom(this.vesselService.getVessel(orgMrn, id));
      } else if (itemType === ItemType.Role) {
        item = await firstValueFrom(this.roleService.getRole(orgMrn, parseInt(id)));
      } else if (itemType === ItemType.Instance && instanceVersion) {
        item = await firstValueFrom(this.instanceService.getInstanceByMRNAndVersion(id, instanceVersion));
      } else {
        return {};
      }
      return preprocess(item, itemType);
    } catch (error) {
      console.error('Error fetching data:', error);
      return {};
    }
  }

  registerData = (itemType: ItemType, body: object, orgMrn: string): Observable<any> => {
    if (itemType === ItemType.User) {
      return this.userService.createUser(body as User, orgMrn);
    } else if (itemType === ItemType.Device) {
      return this.deviceService.createDevice(body as Device, orgMrn);
    } else if (itemType === ItemType.Vessel) {
      return this.vesselService.createVessel(body as Vessel, orgMrn);
    } else if (itemType === ItemType.Service) {
      return this.serviceService.createService(body as Service, orgMrn);
    } else if (itemType === ItemType.Organization) {
      return this.organizationService.applyOrganization(body as Organization);
    } else if (itemType === ItemType.Role) {
      return this.roleService.createRole(body as Role, orgMrn);
    } else if (itemType === ItemType.Instance) {
      return this.instanceService.createInstance(body as InstanceDto);
    }
    return new Observable();
  }

  updateData = (itemType: ItemType, body: object, orgMrn: string, entityMrn: string, version?: string, numberId?: number): Observable<any> => {
    if (itemType === ItemType.User) {
      return this.userService.updateUser(body as User, orgMrn, entityMrn);
    } else if (itemType === ItemType.Device) {
      return this.deviceService.updateDevice(body as Device, orgMrn, entityMrn);
    } else if (itemType === ItemType.Vessel) {
      return this.vesselService.updateVessel(body as Vessel, orgMrn, entityMrn);
    } else if (itemType === ItemType.Service) {
      if (version) {
        return this.serviceService.updateService(body as Service, orgMrn, entityMrn, version);
      } else {
        return this.serviceService.updateService1(body as Service, orgMrn, entityMrn);
      }
    } else if (itemType === ItemType.Organization || itemType === ItemType.OrgCandidate) {
      return this.organizationService.updateOrganization(body as Organization, entityMrn);
    } else if (itemType === ItemType.Role && numberId) {
      return this.roleService.updateRole(body as Role, orgMrn, numberId);
    } else if (itemType === ItemType.Instance && numberId) {
      return this.instanceService.updateInstance(Object.assign({}, body, { id: numberId }) as InstanceDto, numberId);
    }
    return new Observable();
  }

  deleteData = (itemType: ItemType, orgMrn: string, entityMrn: string, version?: string, numberId?: number): Observable<any> => {
    if (itemType === ItemType.User) {
      return this.userService.deleteUser(orgMrn, entityMrn);
    } else if (itemType === ItemType.Device) {
      return this.deviceService.deleteDevice(orgMrn, entityMrn);
    } else if (itemType === ItemType.Vessel) {
      return this.vesselService.deleteVessel(orgMrn, entityMrn);
    } else if (itemType === ItemType.Service) {
      if (version) {
        return this.serviceService.deleteService(orgMrn, entityMrn, version);
      } else {
        return this.serviceService.deleteService1(orgMrn, entityMrn);
      }
    } else if (itemType === ItemType.Organization || itemType === ItemType.OrgCandidate) {
      return this.organizationService.deleteOrg(entityMrn);
    } else if (itemType === ItemType.Role && numberId) {
      return this.roleService.deleteRole(orgMrn, numberId);
    } else if (itemType === ItemType.Instance && numberId) {
      return this.instanceService.deleteInstance(numberId);
    }
    return new Observable();
  }

  migrate = (newServiceMrn: string, orgMrn: string, serviceMrn: string, instanceVersion: string) => {
    return this.serviceService.migrateServiceMrn({mrn: newServiceMrn} as ServicePatch, orgMrn, serviceMrn, instanceVersion);
  }

  approve = (orgMrn: string) => {
    return this.organizationService.approveOrganization(orgMrn);
  }

  createRole = (role: Role, orgMrn: string) => {
    return this.roleService.createRole(role, orgMrn);
  }

  createUser = (user: User, orgMrn: string) => {
    return this.userService.createUser(user, orgMrn);
  }

  verifyG1128Xml = (xml: string) => {
    return this.xmlService.validateXmlWithG1128Schema(xml, 'INSTANCE');
  }

  createXml = (xmlDto: XmlDto) => {
    return this.xmlService.createXml(xmlDto);
  }

  updateXml = (xmlDto: XmlDto, id: number) => {
    return this.xmlService.updateXml(xmlDto, id);
  }
}
