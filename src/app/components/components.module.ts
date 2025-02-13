/*
 * Copyright (c) 2025 Maritime Connectivity Platform Consortium
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
