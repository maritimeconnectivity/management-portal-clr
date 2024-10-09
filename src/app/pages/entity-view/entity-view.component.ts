import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DeviceControllerService } from 'src/app/backend-api/identity-registry';
import { ItemType } from 'src/app/common/menuType';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { EntityFormComponent } from 'src/app/components/entity-form/entity-form.component';

@Component({
  selector: 'app-entity-view',
  standalone: true,
  imports: [
    SharedModule,
    ComponentsModule
  ],
  templateUrl: './entity-view.component.html',
  styleUrl: './entity-view.component.css'
})
export class EntityViewComponent {
  entityType: ItemType = ItemType.Device;
  orgMrn: string = "urn:mrn:mcp:org:mcc-test:horde";
  id: string = "";
  entity: any = {};

  constructor(private route: ActivatedRoute,
    private deviceControllerService: DeviceControllerService
  ) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.parseMyUrl().then(() => {
      this.fetchContent(this.entityType, this.id);
    });
    
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
    });
  }

  parseMyUrl = (): Promise<void> => {
    return firstValueFrom(this.route.url).then(url => {
      this.id = decodeURIComponent(url.pop()?.path || "");
      this.entityType = url.pop()?.path as ItemType;
    });
  }
  
  fetchContent = (entityType: ItemType, id: string) => {
    if (entityType === ItemType.Device) {
      this.deviceControllerService.getDevice(this.orgMrn, id).subscribe(device => {
        this.entity = device;
      });
    }
  }
}
