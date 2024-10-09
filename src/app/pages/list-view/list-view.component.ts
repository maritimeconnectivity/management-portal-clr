import { Component, Input } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { DeviceControllerService } from 'src/app/backend-api/identity-registry';
import { ItemType } from 'src/app/common/menuType';
import { Router } from '@angular/router';
import { SmartExpandableTableComponent } from 'src/app/components/smart-expandable-table/smart-expandable-table.component';
import { ClarityModule } from '@clr/angular';
import { ColumnForResource } from 'src/app/common/columnForMenu';

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
    private router: Router,
    private deviceService: DeviceControllerService) {
    this.isLoading = true;
  }

  ngOnInit() {
    this.deviceService.getOrganizationDevices(this.orgMrn).subscribe(devicesPage => {
      if (devicesPage.content?.length) {
        this.data = devicesPage.content;
        this.setLabel();
        this.isLoading = false;
      }
    });
  }

  filterVisibleFromDetail = (device: {[key: string]: any}) => {
    return Object.keys(device)
      .filter(key => device[key]?.visibleFrom?.includes('list'))
      .reduce((result, key) => {
        result[key] = device[key];
        return result;
      }, {} as {[key: string]: any});
  };

  setLabel = () => {
    this.labels = this.filterVisibleFromDetail(ColumnForResource[this.itemType.toString()]);
  }
  
  onDelete = (selected: any[]) => {
    console.log(selected);
  }

  onAdd = () => {
    console.log("Add");
  }

  onRowSelect = (selected: any) => {
    const id = selected.mrn;// this.menuType === ResourceType.Instance ? event.data.id : event.data.mrn;
    this.router.navigate(['pages/ir/device',
      encodeURIComponent(id)]);
  }
}
