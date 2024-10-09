import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../common/shared/shared.module';
import { ClarityModule } from '@clr/angular';



@NgModule({
  declarations: [ ],
  imports: [
    CommonModule,
    SharedModule,
    ClarityModule,
  ],
  exports: [
  ]
})
export class ComponentsModule { }
