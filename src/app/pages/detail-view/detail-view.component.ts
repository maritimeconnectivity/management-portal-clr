import { NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'gramli-angular-notifier';
import { firstValueFrom, Observable } from 'rxjs';
import { Device, DeviceControllerService, MMS, MmsControllerService, Organization, OrganizationControllerService, Role, RoleControllerService, Service, ServiceControllerService, User, UserControllerService, Vessel, VesselControllerService } from 'src/app/backend-api/identity-registry';
import { InstanceControllerService, InstanceDto } from 'src/app/backend-api/service-registry';
import { formatVesselToUpload } from 'src/app/common/dataformatter';
import { ItemType } from 'src/app/common/menuType';
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
  itemType: ItemType = ItemType.Device;
  orgMrn: string = "urn:mrn:mcp:org:mcc-test:horde";
  id: string = "";
  numberId = -1;
  instanceVersion = "";
  isEditing = true;
  isLoading = false;
  isForNew = false;
  item: any = {};
  private readonly notifier: NotifierService;
  @ViewChild('customNotification', { static: true }) customNotificationTmpl: any;

  constructor(private route: ActivatedRoute,
    private deviceControllerService: DeviceControllerService,
    private organizationControllerService: OrganizationControllerService,
    private userControllerService: UserControllerService,
    private vesselControllerService: VesselControllerService,
    private mmsControllerService: MmsControllerService,
    private serviceControllerService: ServiceControllerService,
    private roleControllerService: RoleControllerService,
    private instanceControllerService: InstanceControllerService,
    private notifierService: NotifierService,
    private translate: TranslateService
  ) { 
    this.notifier = notifierService;
    translate.use('en-GB');
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.parseMyUrl().then(() => {
      this.fetchData(this.itemType, this.id);
    });
  }

  parseMyUrl = (): Promise<void> => {
    return firstValueFrom(this.route.url).then(url => {
      this.id = decodeURIComponent(url.pop()?.path || "");
      this.itemType = url.pop()?.path as ItemType;
    });
  }
  
  fetchData = (entityType: ItemType, id: string) => {
    if (entityType === ItemType.Device) {
      this.deviceControllerService.getDevice(this.orgMrn, id).subscribe(device => {
        this.item = device;
      });
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
      return this.userControllerService.createUser(body as User, orgMrn);
    } else if (context === ItemType.Device) {
      return this.deviceControllerService.createDevice(body as Device, orgMrn);
    } else if (context === ItemType.Vessel) {
      return this.vesselControllerService.createVessel(formatVesselToUpload(body) as Vessel, orgMrn);
    } else if (context === ItemType.MMS) {
      return this.mmsControllerService.createMMS(body as MMS, orgMrn);
    } else if (context === ItemType.Service) {
      return this.serviceControllerService.createService(body as Service, orgMrn);
    } else if (context === ItemType.Organization) {
      return this.organizationControllerService.applyOrganization(body as Organization);
    } else if (context === ItemType.Role) {
      return this.roleControllerService.createRole(body as Role, orgMrn);
    } else if (context === ItemType.Instance) {
      return this.instanceControllerService.createInstance(body as InstanceDto);
    }
    return new Observable();
  }

  updateData = (context: ItemType, body: object, orgMrn: string, entityMrn: string, version?: string, instanceId?: number): Observable<any> => {
    if (context === ItemType.User) {
      return this.userControllerService.updateUser(body as User, orgMrn, entityMrn);
    } else if (context === ItemType.Device) {
      return this.deviceControllerService.updateDevice(body as Device, orgMrn, entityMrn);
    } else if (context === ItemType.Vessel) {
      return this.vesselControllerService.updateVessel(formatVesselToUpload(body) as Vessel, orgMrn, entityMrn);
    } else if (context === ItemType.MMS) {
      return this.mmsControllerService.updateMMS(body as MMS, orgMrn, entityMrn);
    } else if (context === ItemType.Service && version) {
      return this.serviceControllerService.updateService(body as Service, orgMrn, entityMrn, version);
    } else if (context === ItemType.Organization || context === ItemType.OrgCandidate) {
      return this.organizationControllerService.updateOrganization(body as Organization, entityMrn);
    } else if (context === ItemType.Role) {
      return this.roleControllerService.updateRole(body as Role, orgMrn, this.numberId);
    } else if (context === ItemType.Instance && instanceId) {
      return this.instanceControllerService.updateInstance(Object.assign({}, body, {id: instanceId}) as InstanceDto, instanceId);
    }
    return new Observable();
  }

  deleteData = (context: ItemType, orgMrn: string, entityMrn: string, version?: string, instanceId?: number): Observable<any> => {
    if (context === ItemType.User) {
      return this.userControllerService.deleteUser(orgMrn, entityMrn);
    } else if (context === ItemType.Device) {
      return this.deviceControllerService.deleteDevice(orgMrn, entityMrn);
    } else if (context === ItemType.Vessel) {
      return this.vesselControllerService.deleteVessel(orgMrn, entityMrn);
    } else if (context === ItemType.MMS) {
      return this.mmsControllerService.deleteMMS(orgMrn, entityMrn);
    } else if (context === ItemType.Service && version) {
      return this.serviceControllerService.deleteService(orgMrn, entityMrn, version);
    } else if (context === ItemType.Organization || context === ItemType.OrgCandidate) {
      return this.organizationControllerService.deleteOrg(entityMrn);
    } else if (context === ItemType.Role) {
      return this.roleControllerService.deleteRole(orgMrn, this.numberId);
    } else if (context === ItemType.Instance) {
      return this.instanceControllerService.deleteInstance(this.numberId);
    }
    return new Observable();
  }
}
