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

import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ClarityModule, ClrDatagridModule } from '@clr/angular';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { ClarityIcons, downloadIcon, plusIcon, timesIcon } from '@cds/core/icon';
import { toCamelCase } from 'src/app/common/stringUtils';
import { ItemType, timestampKeys } from 'src/app/common/menuType';
import { timestamp } from 'rxjs';
import { convertTime } from 'src/app/common/timeConverter';

ClarityIcons.addIcons(downloadIcon, timesIcon, plusIcon);

@Component({
  selector: 'app-smart-table',
  standalone: true,
  imports: [
    ClarityModule,
    ClrDatagridModule
],
  templateUrl: './smart-table.component.html',
  styleUrl: './smart-table.component.css'
})
export class SmartTableComponent {
  @Input() data: any[] = [];
  @Input() itemType: ItemType = ItemType.Device;
  @Input() labels: {[key: string]: any} = {};
  @Input() placeholder: string = 'We couldn\'t find any data!';
  @Input() onDownload: ((selected: any[]) => void) | undefined;
  @Input() onDelete: ((selected: any[]) => void) | undefined;
  @Input() onAdd: (() => void) | undefined;
  @Input() deleteText: string = 'Delete';
  @Input() downloadText: string = 'Download';
  @Input() addText: string = 'Add';
  @Input() selectedIds: any[] = [];
  @Output() onRowSelect: EventEmitter<any> = new EventEmitter<any>();

  selected: any[] = [];
  detail: any = {};
  isLoading: boolean = false;
  labelKeys: string[] = [];
  labelTitles: string[] = [];

  constructor() {
    this.isLoading = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes['data'].currentValue.length > 0) {
      this.labelKeys = Object.keys(this.labels);
      this.labelTitles = Object.values(this.labels).map((label: any) => label.title);
    }
    this.isLoading = false;
    if (this.data.length > 0 && this.selectedIds.length > 0) {
      this.selected = this.data.filter((item: any) => this.selectedIds[0] === item.serialNumber);
    }
  }

  userRowSelect = (selected: any) => {
    if (this.onRowSelect) {
      this.onRowSelect.emit(selected);
    }
  }

  isTimestampFormat(key: string): boolean {
    return timestampKeys.includes(key);
  }

  convertTimeString = (time: string): string => {
    return convertTime(time);
  }

}
