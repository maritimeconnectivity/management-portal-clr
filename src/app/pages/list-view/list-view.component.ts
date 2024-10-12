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
  @Input() itemType: ItemType = ItemType.Device;
  isLoading: boolean = false;
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
    private notifierService: NotifierService
) {
    this.isLoading = true;
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.parseMyUrl().then(() => {
      this.fetchData(this.itemType);
    });
  }

  parseMyUrl = (): Promise<void> => {
    return firstValueFrom(this.route.url).then(url => {
      this.itemType = url.pop()?.path as ItemType;
    });
  }

  fetchData = (entityType: ItemType) => {
    if (entityType === ItemType.Device) {
      this.deviceService.getOrganizationDevices(this.orgMrn).subscribe(page => {
        if (page.content?.length) {
          this.data = page.content;
          this.setLabel();
          this.isLoading = false;
        }
      });
    } else if(entityType === ItemType.Organization) {
      this.organizationService.getOrganization().subscribe(page => {
        if (page.content?.length) {
          this.data = page.content;
          this.setLabel();
          this.isLoading = false;
        }
      });
    } else if(entityType === ItemType.Service) {
      this.serviceService.getOrganizationServices(this.orgMrn).subscribe(page => {
        if (page.content?.length) {
          this.data = page.content;
          this.setLabel();
          this.isLoading = false;
        }
      });
    } else if(entityType === ItemType.User) {
      this.userService.getOrganizationUsers(this.orgMrn).subscribe(page => {
        if (page.content?.length) {
          this.data = page.content;
          this.setLabel();
          this.isLoading = false;
        }
      });
    } else if(entityType === ItemType.Vessel) {
      this.vesselService.getOrganizationVessels(this.orgMrn).subscribe(page => {
        if (page.content?.length) {
          this.data = page.content;
          this.setLabel();
          this.isLoading = false;
        }
      });
    } else if(entityType === ItemType.Role) {
      this.roleService.getRoles(this.orgMrn).subscribe(page => {
        if (page.length) {
          this.data = page;
          this.setLabel();
          this.isLoading = false;
        }
      });
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

  setLabel = () => {
    this.labels = this.filterVisibleForList(ColumnForResource[this.itemType.toString()]);
  }
  
  onDelete = (selected: any[]) => {
    if (selected.length === 0) {
      this.notifier.notify('error', 'success.resource.delete');
    } else {
      this.notifier.notify('success', 'success.resource.delete');
    }
  }

  onAdd = () => {
    this.router.navigateByUrl('/pages/ir/'+this.itemType+'/new');
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
}
