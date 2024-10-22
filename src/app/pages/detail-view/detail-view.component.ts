import { NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'gramli-angular-notifier';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Device, DeviceControllerService, MMS, MmsControllerService, Organization, OrganizationControllerService, Role, RoleControllerService, Service, ServiceControllerService, User, UserControllerService, Vessel, VesselControllerService } from 'src/app/backend-api/identity-registry';
import { InstanceControllerService, InstanceDto } from 'src/app/backend-api/service-registry';
import { formatVesselToUpload } from 'src/app/common/dataformatter';
import { ItemType } from 'src/app/common/menuType';
import { getMrnPrefixFromOrgMrn } from 'src/app/common/mrnUtil';
import { ComponentsModule } from 'src/app/components/components.module';

@Component({
  selector: 'app-detail-view',
  standalone: true,
  imports: [
    NgIf,
    ComponentsModule,
    ClarityModule
  ],
  templateUrl: './detail-view.component.html',
  styleUrl: './detail-view.component.css'
})
export class DetailViewComponent {
  itemType: ItemType = ItemType.None;
  orgMrn: string = "urn:mrn:mcp:org:mcc-test:horde";
  id: string = "";
  numberId = -1;
  instanceVersion = "";
  mrnPrefix = "urn:mrn:";
  isEditing = true;
  isLoading = false;
  isForNew = false;
  item: any = {};
  private readonly notifier: NotifierService;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceControllerService,
    private organizationService: OrganizationControllerService,
    private userService: UserControllerService,
    private vesselService: VesselControllerService,
    private serviceService: ServiceControllerService,
    private roleService: RoleControllerService,
    private instanceService: InstanceControllerService,
    private notifierService: NotifierService,
    private translate: TranslateService,
    private authService: AuthService,
  ) { 
    this.notifier = notifierService;
    translate.use('en-GB');
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.parseMyUrl().then(async () => {
      if (this.isForNew) {
        this.authService.getOrgMrn().then(orgMrn => {
          this.mrnPrefix = getMrnPrefixFromOrgMrn(orgMrn, this.itemType);
          this.isEditing = true;
          this.item = {mrn: this.mrnPrefix};
        }
        );
        
      } else {
        this.item = await this.fetchData(this.itemType, this.id);
      }
    });
  }

  parseMyUrl = (): Promise<void> => {
    return firstValueFrom(this.route.url).then(url => {
      if (url.length === 4) {
        this.instanceVersion = decodeURIComponent(url.pop()?.path || "");
      }
      this.id = decodeURIComponent(url.pop()?.path || "");
      this.itemType = url.pop()?.path as ItemType;
      if (this.id === "new") {
        this.isForNew = true;
      }
    });
  }
  
  fetchData = async (entityType: ItemType, id: string): Promise<any | undefined> => {
    try {
      let item;
      if (entityType === ItemType.Device) {
        item = await firstValueFrom(this.deviceService.getDevice(this.orgMrn, id));
      } else if (entityType === ItemType.Organization) {
        item = await firstValueFrom(this.organizationService.getOrganization1(id));
      } else if (entityType === ItemType.User) {
        item = await firstValueFrom(this.userService.getUser(this.orgMrn, id));
      } else if (entityType === ItemType.Service) {
        item = await firstValueFrom(this.serviceService.getServiceVersion(this.orgMrn, id, this.instanceVersion));
      } else if (entityType === ItemType.Vessel) {
        item = await firstValueFrom(this.vesselService.getVessel(this.orgMrn, id));
      } else if (entityType === ItemType.Role) {
        item = await firstValueFrom(this.roleService.getRole(this.orgMrn, parseInt(id)));
      } else {
        return {};
      }
      return item;
    } catch (error) {
      console.error('Error fetching data:', error);
      return {};
    }
  }

  edit = (item: any) => {
    this.isEditing = true;
  }

  cancel = () => {
    this.isEditing = false;
  }

  submit = (item: any) => {
    this.submitDataToBackend(item, this.id);
  }

  submitDataToBackend(body: object, id?: string) {
    this.isLoading = true;
    if (!id) {
      this.registerData(this.itemType, body, this.orgMrn).subscribe(
        res => {
          this.notifier.notify('success', this.translate.instant('success.resource.create'));
          this.isLoading = false;
        },
        err => {
          this.notifierService.notify('error',
            this.translate.instant('error.resource.creationFailed') + err.error.message);
          this.isLoading = false;
        }
      );
    } else {
      this.updateData(this.itemType, body, this.orgMrn, id, this.instanceVersion, this.numberId).subscribe(
        res => {
          this.notifier.notify('success', 'success.resource.update');
          this.isLoading = false;
        },
        err => {
          this.notifierService.notify('error',
            this.translate.instant('error.resource.creationFailed') + err.error.message);
            this.isLoading = false;
        });
    }
  }

  registerData = (context: ItemType, body: object, orgMrn: string): Observable<any> => {
    if (context === ItemType.User) {
      return this.userService.createUser(body as User, orgMrn);
    } else if (context === ItemType.Device) {
      return this.deviceService.createDevice(body as Device, orgMrn);
    } else if (context === ItemType.Vessel) {
      return this.vesselService.createVessel(formatVesselToUpload(body) as Vessel, orgMrn);
    } else if (context === ItemType.Service) {
      return this.serviceService.createService(body as Service, orgMrn);
    } else if (context === ItemType.Organization) {
      return this.organizationService.applyOrganization(body as Organization);
    } else if (context === ItemType.Role) {
      return this.roleService.createRole(body as Role, orgMrn);
    } else if (context === ItemType.Instance) {
      return this.instanceService.createInstance(body as InstanceDto);
    }
    return new Observable();
  }

  updateData = (context: ItemType, body: object, orgMrn: string, entityMrn: string, version?: string, instanceId?: number): Observable<any> => {
    if (context === ItemType.User) {
      return this.userService.updateUser(body as User, orgMrn, entityMrn);
    } else if (context === ItemType.Device) {
      return this.deviceService.updateDevice(body as Device, orgMrn, entityMrn);
    } else if (context === ItemType.Vessel) {
      return this.vesselService.updateVessel(formatVesselToUpload(body) as Vessel, orgMrn, entityMrn);
    } else if (context === ItemType.Service && version) {
      return this.serviceService.updateService(body as Service, orgMrn, entityMrn, version);
    } else if (context === ItemType.Organization || context === ItemType.OrgCandidate) {
      return this.organizationService.updateOrganization(body as Organization, entityMrn);
    } else if (context === ItemType.Role) {
      return this.roleService.updateRole(body as Role, orgMrn, this.numberId);
    } else if (context === ItemType.Instance && instanceId) {
      return this.instanceService.updateInstance(Object.assign({}, body, {id: instanceId}) as InstanceDto, instanceId);
    }
    return new Observable();
  }

  deleteData = (context: ItemType, orgMrn: string, entityMrn: string, version?: string, instanceId?: number): Observable<any> => {
    if (context === ItemType.User) {
      return this.userService.deleteUser(orgMrn, entityMrn);
    } else if (context === ItemType.Device) {
      return this.deviceService.deleteDevice(orgMrn, entityMrn);
    } else if (context === ItemType.Vessel) {
      return this.vesselService.deleteVessel(orgMrn, entityMrn);
    } else if (context === ItemType.Service && version) {
      return this.serviceService.deleteService(orgMrn, entityMrn, version);
    } else if (context === ItemType.Organization || context === ItemType.OrgCandidate) {
      return this.organizationService.deleteOrg(entityMrn);
    } else if (context === ItemType.Role) {
      return this.roleService.deleteRole(orgMrn, this.numberId);
    } else if (context === ItemType.Instance) {
      return this.instanceService.deleteInstance(this.numberId);
    }
    return new Observable();
  }

  issueCert = () => {
    this.notifier.notify('success', 'success.resource.issueCert');
  }

  revokeCerts = (certs: any[]) => {
    if (certs.length === 0) {
      this.notifier.notify('error', 'success.resource.revokeCerts');
    } else {
      this.notifier.notify('success', 'success.resource.revokeCerts');
    }
  }

  downloadCerts = (selected: any[]) => {
    if (selected.length === 0) {
      this.notifier.notify('error', 'success.resource.downloadCerts');
    } else {
      this.notifier.notify('success', 'success.resource.downloadCerts');
    }
  }

  back = () => {
    this.router.navigateByUrl('/pages/ir/'+this.itemType);
  }
}
