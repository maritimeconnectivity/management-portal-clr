import { Component, Input } from '@angular/core';
import { SmartTableComponent } from "../../components/smart-table/smart-table.component";
import { ComponentsModule } from 'src/app/components/components.module';
import { DeviceControllerService } from 'src/app/backend-api/identity-registry';
import { ResourceType } from 'src/app/common/menuType';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [
    ComponentsModule,
    SmartTableComponent],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css'
})
export class ListViewComponent {
  @Input() resourceType: ResourceType = ResourceType.Device;
  isLoading: boolean = false;
  orgMrn: string = "urn:mrn:mcp:org:mcc-test:horde";

  columns = ["MRN", "Name", "Updated At"];
  data: { mrn: string; name: string; updatedAt: Date | undefined; }[] = [];
  

  constructor(
    private router: Router,
    private deviceService: DeviceControllerService) {
    this.isLoading = true;
  }

  ngOnInit() {
    this.deviceService.getOrganizationDevices(this.orgMrn).subscribe(devicesPage => {
      if (devicesPage.content?.length) {
        const devices = devicesPage.content;
        const data = devices.map(device => {
          return {
            mrn: device.mrn,
            name: device.name,
            updatedAt: device.updatedAt
          }
        });
        this.data = data;
        this.isLoading = false;
      }
    });
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
