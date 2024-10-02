import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../common/shared/shared.module';
import { EntityFormComponent } from './entity-form/entity-form.component';



@NgModule({
  declarations: [ ],
  imports: [
    EntityFormComponent,
    CommonModule,
    SharedModule
  ],
  exports: [
    EntityFormComponent
  ]
})
export class ComponentsModule { }
