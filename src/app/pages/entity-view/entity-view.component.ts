import { Component } from '@angular/core';
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

}
