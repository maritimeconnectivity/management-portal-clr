import { Component, Input } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { DeviceControllerService, OrganizationControllerService, ServiceControllerService, UserControllerService, VesselControllerService } from 'src/app/backend-api/identity-registry';
import { ItemType } from 'src/app/common/menuType';
import { ActivatedRoute, Router } from '@angular/router';
import { SmartExpandableTableComponent } from 'src/app/components/smart-expandable-table/smart-expandable-table.component';
import { ClarityModule } from '@clr/angular';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { firstValueFrom } from 'rxjs';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceControllerService,
    private organizationService: OrganizationControllerService,
    private serviceService: ServiceControllerService,
    private userService: UserControllerService,
    private vesselService: VesselControllerService,
) {
    this.isLoading = true;
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
      this.deviceService.getOrganizationDevices(this.orgMrn).subscribe(devicesPage => {
        if (devicesPage.content?.length) {
          this.data = devicesPage.content;
          this.setLabel();
          this.isLoading = false;
        }
      });
    } else if(entityType === ItemType.Organization) {
      this.organizationService.getOrganization().subscribe(organizationsPage => {
        if (organizationsPage.content?.length) {
          this.data = organizationsPage.content;
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
    console.log(selected);
  }

  onAdd = () => {
    this.router.navigateByUrl('/pages/ir/'+this.itemType+'/new');
  }
}
