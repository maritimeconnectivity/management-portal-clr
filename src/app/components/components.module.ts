import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../common/shared/shared.module';
import { ClarityModule } from '@clr/angular';
import { ItemFormComponent } from './item-form/item-form.component';
import { ItemViewComponent } from './item-view/item-view.component';
import { SmartTableComponent } from './smart-table/smart-table.component';
import { SmartExpandableTableComponent } from './smart-expandable-table/smart-expandable-table.component';



@NgModule({
  declarations: [ ],
  imports: [
    CommonModule,
    SharedModule,
    ClarityModule,
    ItemFormComponent,
    ItemViewComponent,
    SmartTableComponent,
    SmartExpandableTableComponent
  ],
  exports: [
    ItemFormComponent,
    ItemViewComponent,
    SmartTableComponent,
    SmartExpandableTableComponent
  ]
})
export class ComponentsModule { }
