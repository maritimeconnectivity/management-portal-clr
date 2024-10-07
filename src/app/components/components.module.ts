import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../common/shared/shared.module';
import { EntityFormComponent } from './entity-form/entity-form.component';
import { ClarityModule } from '@clr/angular';



@NgModule({
  declarations: [ ],
  imports: [
    EntityFormComponent,
    CommonModule,
    SharedModule,
    ClarityModule,
  ],
  exports: [
    EntityFormComponent
  ]
})
export class ComponentsModule { }
