import { Injectable } from '@angular/core';
import { ItemType } from '../menuType';
import { firstValueFrom, Observable } from 'rxjs';
import { Device, DeviceControllerService, Organization, OrganizationControllerService, Role, RoleControllerService, Service, ServiceControllerService, ServicePatch, User, UserControllerService, Vessel, VesselControllerService } from 'src/app/backend-api/identity-registry';
import { preprocess } from '../itemPreprocessor';
import { InstanceControllerService, InstanceDto } from 'src/app/backend-api/service-registry';
import { postprocess } from '../itemPostprocessor';

@Injectable({
  providedIn: 'root'
})
export class ItemManagerService {

  constructor(
    private deviceService: DeviceControllerService,
    private organizationService: OrganizationControllerService,
    private userService: UserControllerService,
    private serviceService: ServiceControllerService,
    private vesselService: VesselControllerService,
    private roleService: RoleControllerService,
    private instanceService: InstanceControllerService
  ) { }

  fetchData = async (itemType: ItemType, orgMrn: string, id: string, instanceVersion?: string): Promise<any | undefined> => {
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
      return this.vesselService.createVessel(postprocess(body, itemType) as Vessel, orgMrn);
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
      return this.vesselService.updateVessel(postprocess(body, itemType) as Vessel, orgMrn, entityMrn);
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
}
