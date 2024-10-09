import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DeviceControllerService } from 'src/app/backend-api/identity-registry';
import { ItemType } from 'src/app/common/menuType';
import { ItemFormComponent } from 'src/app/components/item-form/item-form.component';

@Component({
  selector: 'app-detail-view',
  standalone: true,
  imports: [
    ItemFormComponent
  ],
  templateUrl: './detail-view.component.html',
  styleUrl: './detail-view.component.css'
})
export class DetailViewComponent {
  itemType: ItemType = ItemType.Device;
  orgMrn: string = "urn:mrn:mcp:org:mcc-test:horde";
  id: string = "";
  item: any = {};

  constructor(private route: ActivatedRoute,
    private deviceControllerService: DeviceControllerService
  ) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.parseMyUrl().then(() => {
      this.fetchContent(this.itemType, this.id);
    });
    
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
    });
  }

  parseMyUrl = (): Promise<void> => {
    return firstValueFrom(this.route.url).then(url => {
      this.id = decodeURIComponent(url.pop()?.path || "");
      this.itemType = url.pop()?.path as ItemType;
    });
  }
  
  fetchContent = (entityType: ItemType, id: string) => {
    if (entityType === ItemType.Device) {
      this.deviceControllerService.getDevice(this.orgMrn, id).subscribe(device => {
        this.item = device;
      });
    }
  }
}
