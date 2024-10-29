import { Component, Input, ViewChild } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { DeviceControllerService, OrganizationControllerService, RoleControllerService, ServiceControllerService, ServicePatch, UserControllerService, VesselControllerService } from 'src/app/backend-api/identity-registry';
import { ItemType } from 'src/app/common/menuType';
import { ActivatedRoute, Router } from '@angular/router';
import { SmartExpandableTableComponent } from 'src/app/components/smart-expandable-table/smart-expandable-table.component';
import { ClarityModule } from '@clr/angular';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { firstValueFrom } from 'rxjs';
import { NotifierService } from 'gramli-angular-notifier';
import { InstanceControllerService } from 'src/app/backend-api/service-registry';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [
    ClarityModule,
    ComponentsModule,
    SmartExpandableTableComponent],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css'
})

export class ListViewComponent {
  @ViewChild(SmartExpandableTableComponent) exTable!: SmartExpandableTableComponent;
  @Input() itemType: ItemType = ItemType.None;
  orgMrn: string = "";
  data: any[] = [];
  labels: {[key: string]: any} = {};
  viewContext = 'list';
  totalPages = 0;
  totalElements = 0;
  hasAdminPermission = false;
  private readonly notifier: NotifierService;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceControllerService,
    private organizationService: OrganizationControllerService,
    private serviceService: ServiceControllerService,
    private userService: UserControllerService,
    private vesselService: VesselControllerService,
    private roleService: RoleControllerService,
    private instanceService: InstanceControllerService,
    private notifierService: NotifierService,
    private authService: AuthService
) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.parseMyUrl().then(() => {
      this.authService.getOrgMrn().then((orgMrn) => {
        this.orgMrn = orgMrn;
        this.setLabel();
        this.authService.hasPermission(this.itemType).then((hasPermission) => {
          this.hasAdminPermission = hasPermission;
        });
      });
    });
  }

  setLabel = () => {
    this.labels = this.filterVisibleForList(ColumnForResource[this.itemType.toString()]);
  }

  parseMyUrl = (): Promise<void> => {
    return firstValueFrom(this.route.url).then(url => {
      this.itemType = url.pop()?.path as ItemType;
    }).catch((err) => {
      this.router.navigateByUrl('/pages/not-found');
    });
  }

  fetchData = async (entityType: ItemType, pageNumber: number, elementsPerPage: number): Promise<any[] | undefined> => {
    try {
      let page;
      if (entityType === ItemType.Device) {
        page = await firstValueFrom(this.deviceService.getOrganizationDevices(this.orgMrn, pageNumber, elementsPerPage));
        this.totalPages = page.totalPages!;
        this.totalElements = page.totalElements!;
      } else if(entityType === ItemType.Organization) {
        page = await firstValueFrom(this.organizationService.getOrganization(pageNumber, elementsPerPage));
        this.totalPages = page.totalPages!;
        this.totalElements = page.totalElements!;
      } else if(entityType === ItemType.User) {
        page = await firstValueFrom(this.userService.getOrganizationUsers(this.orgMrn, pageNumber, elementsPerPage));
        this.totalPages = page.totalPages!;
        this.totalElements = page.totalElements!;
      } else if(entityType === ItemType.Service) {
        page = await firstValueFrom(this.serviceService.getOrganizationServices(this.orgMrn, pageNumber, elementsPerPage));
        this.totalPages = page.totalPages!;
        this.totalElements = page.totalElements!;
      } else if(entityType === ItemType.Vessel) {
        page = await firstValueFrom(this.vesselService.getOrganizationVessels(this.orgMrn, pageNumber, elementsPerPage));
        this.totalPages = page.totalPages!;
        this.totalElements = page.totalElements!;
      } else if(entityType === ItemType.Role) {
        page = await firstValueFrom(this.roleService.getRoles(this.orgMrn));
      } else {
        return [];
      }
      return Array.isArray(page) ? page : page.content;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }

  filterVisibleForList = (device: {[key: string]: any}) => {
    return Object.keys(device)
      .filter(key => device[key]?.visibleFrom?.includes('list'))
      .reduce((result, key) => {
        result[key] = device[key];
        return result;
      }, {} as {[key: string]: any});
  };

  deleteData = async (itemType: ItemType, item: any): Promise<any> => {
    const id = item.mrn;
    if (itemType === ItemType.Device) {
      await firstValueFrom(this.deviceService.deleteDevice(this.orgMrn, id));
    } else if (itemType === ItemType.Organization) {
      await firstValueFrom(this.organizationService.deleteOrg(id));
    } else if (itemType === ItemType.User) {
      await firstValueFrom(this.userService.deleteUser(this.orgMrn, id));
    } else if (itemType === ItemType.Service) {
      if (item.instanceVersion) {
        await firstValueFrom(this.serviceService.deleteService(this.orgMrn, id, item.instanceVersion));
      } else {
        await firstValueFrom(this.serviceService.deleteService1(this.orgMrn, id));
      }
    } else if (itemType === ItemType.Vessel) {
      await firstValueFrom(this.vesselService.deleteVessel(this.orgMrn, id));
    } else if (itemType === ItemType.Role) {
      await firstValueFrom(this.roleService.deleteRole(this.orgMrn, parseInt(item.id)));
    }
  }
  
  onDelete = async (selected: any[]) => {
    if (selected.length === 0) {
      this.notifier.notify('error', 'success.resource.delete.done');
    } else {
      await selected.forEach(async (item) => {
        await this.deleteData(this.itemType, item).then(() => {
          this.notifier.notify('success', 'success.resource.delete.done');
        }).catch((err) => {
          this.notifier.notify('error', 'success.resource.delete');
        });
        
        if (this.exTable?.expanded) {
          // when delete has done in item view
          this.refreshData();
          this.exTable?.back();
        } else {
          this.refreshData();
        }
      });
    }
  }

  onAdd = () => {
    this.router.navigateByUrl('/pages/ir/'+this.itemType+'/new');
  }

  refreshData = () => {
    this.exTable?.loadData();
  }

  edit = (selectedItem: any) => {
    if (this.itemType === ItemType.Role) {
      this.router.navigateByUrl('/pages/ir/'+this.itemType+'/'+selectedItem.id);
    } else if (this.itemType === ItemType.Service) {
      if (selectedItem.instanceVersion) {
        this.router.navigateByUrl('/pages/ir/'+this.itemType+'/'+selectedItem.mrn+'/'+selectedItem.instanceVersion); //backward compatibility
      } else {
        this.router.navigateByUrl('/pages/ir/'+this.itemType+'/'+selectedItem.mrn);
      }
    } else {
      this.router.navigateByUrl('/pages/ir/'+this.itemType+'/'+selectedItem.mrn);
    }
  }

  migrate = (service: any) => {
    this.serviceService.migrateServiceMrn({mrn: service.newServiceMrn} as ServicePatch, this.orgMrn, service.mrn, service.instanceVersion).subscribe(
      (res) => {
        // Handle successful response, e.g., process the certificate if needed
        this.notifier.notify('success', 'success.resource.migrate');
        this.refreshData();
      },
      err => {
        this.notifier.notify('error', 'success.resource.migrate');
      });
  }
}
