import { Component, Input, ViewChild } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { DeviceControllerService, OrganizationControllerService, RoleControllerService, ServiceControllerService, UserControllerService, VesselControllerService } from 'src/app/backend-api/identity-registry';
import { ItemType } from 'src/app/common/menuType';
import { ActivatedRoute, Router } from '@angular/router';
import { SmartExpandableTableComponent } from 'src/app/components/smart-expandable-table/smart-expandable-table.component';
import { ClarityModule } from '@clr/angular';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { firstValueFrom } from 'rxjs';
import { NotifierService } from 'gramli-angular-notifier';
import { InstanceControllerService } from 'src/app/backend-api/service-registry';

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
  orgMrn: string = "urn:mrn:mcp:org:mcc-test:horde";
  data: any[] = [];
  labels: {[key: string]: any} = {};
  viewContext = 'list';
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
    private notifierService: NotifierService
) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.parseMyUrl().then(() => {
      this.setLabel();
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

  fetchData = async (entityType: ItemType): Promise<any[] | undefined> => {
    try {
      let page;
      if (entityType === ItemType.Device) {
        page = await firstValueFrom(this.deviceService.getOrganizationDevices(this.orgMrn));
      } else if(entityType === ItemType.Organization) {
        page = await firstValueFrom(this.organizationService.getOrganization());
      } else if(entityType === ItemType.User) {
        page = await firstValueFrom(this.userService.getOrganizationUsers(this.orgMrn));
      } else if(entityType === ItemType.Service) {
        page = await firstValueFrom(this.serviceService.getOrganizationServices(this.orgMrn));
      } else if(entityType === ItemType.Vessel) {
        page = await firstValueFrom(this.vesselService.getOrganizationVessels(this.orgMrn));
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
    try {
      const id = item.mrn;
      if (itemType === ItemType.Device) {
        await firstValueFrom(this.deviceService.deleteDevice(this.orgMrn, id));
      } else if (itemType === ItemType.Organization) {
        await firstValueFrom(this.organizationService.deleteOrg(id));
      } else if (itemType === ItemType.User) {
        await firstValueFrom(this.userService.deleteUser(this.orgMrn, id));
      } else if (itemType === ItemType.Service) {
        await firstValueFrom(this.serviceService.deleteService(this.orgMrn, id, item.instanceVersion));
      } else if (itemType === ItemType.Vessel) {
        await firstValueFrom(this.vesselService.deleteVessel(this.orgMrn, id));
      } else if (itemType === ItemType.Role) {
        await firstValueFrom(this.roleService.deleteRole(this.orgMrn, parseInt(item.id)));
      }
    } catch(error) {
      this.notifier.notify('error', 'success.resource.delete');
    }
  }
  
  onDelete = async (selected: any[]) => {
    if (selected.length === 0) {
      this.notifier.notify('error', 'success.resource.delete');
    } else {
      await selected.forEach(async (item) => {
        await this.deleteData(this.itemType, item);
        this.notifier.notify('success', 'success.resource.delete');
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
}
