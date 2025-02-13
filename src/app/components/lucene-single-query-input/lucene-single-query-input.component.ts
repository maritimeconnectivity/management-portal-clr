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

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityIcons, codeIcon } from '@cds/core/icon';
import { ClarityModule, ClrAlertModule, ClrComboboxModule } from '@clr/angular';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { LuceneComponent } from 'src/app/common/lucene-query/lucene-component';
import { QueryFieldInfo } from 'src/app/common/lucene-query/queryFieldInfo';
import { srFieldInfo } from 'src/app/common/lucene-query/service-registry-field-info';
import { ItemType } from 'src/app/common/menuType';
const shortid = require('shortid');
ClarityIcons.addIcons(codeIcon);

@Component({
  selector: 'app-lucene-single-query-input',
  standalone: true,
  imports: [
    ClarityModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './lucene-single-query-input.component.html',
  styleUrl: './lucene-single-query-input.component.css'
})

export class LuceneSingleQueryInputComponent implements OnInit, LuceneComponent {
  options: string[] = [];
  selectedItem: string = '';
  selectedOption: string = '';
  field: string = '';
  fieldValue: string = '';
  valueEditable: boolean = false;
  value: string = '';
  selectOptions: { title: string, value: string }[] = [];

  @Input() requireCloseBtn: boolean = true;
  @Input() requireExtendBtn: boolean = true;
  @Input() requireInfo: boolean = false;
  @Input() id: string = '';
  @Input() data: { id: string, [key: string]: any } = { id: ''};
  @Input() fieldInfo: QueryFieldInfo[] = srFieldInfo;
  @Output() update = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() extend = new EventEmitter<any>();

  constructor() {
    this.options = this.fieldInfo?.map(e => e.name);
    this.id = shortid.generate();
    this.data = {id: this.id};
  }

  loadComponent(): void {
      
  }

  ngOnInit(): void {
    this.applyData();
  }

  applyData() {
    if (this.fieldInfo) {
      this.selectedItem = this.getFilteredKey(this.data).pop()!;
      this.field = this.selectedItem;
      this.fieldValue = this.data[this.selectedItem] ? this.data[this.selectedItem] : '';
      this.selectedOption = this.fieldValue;
      if (this.selectedItem.length > 0) {
        const filtered = Object.entries(ColumnForResource[ItemType.Instance.toString()]).filter(([key, value]) => {
          if (key === this.selectedItem && value.options) {
            return value;
          } else {
            return null; 
          }
        });
        if (filtered.length > 0) {
          this.selectOptions = filtered.pop()![1].options;
        }
      }
    }
  }

  getFilteredKey(data: object) {
    const array1 = Object.keys(data);
    const array2 = this.fieldInfo.map(e => e.value);
    return array1.filter(value => array2.includes(value));
  }

  onEdit(event: any): void {
    const value: string = event.target.value;
    if (this.field) {
      this.data = {id: this.id, [this.field]: value};
      this.fieldValue = value;
      this.update.emit({id: this.id, data: this.data});
    }
  }

  onSelectionChange(event: any): void {
    const value = event.target.value;
    this.field = value;
    this.valueEditable = true;
    this.data = {id: this.id, [this.field]: this.fieldValue};
    this.update.emit({id: this.id, data: this.data});
  }

  onDelete(): void {
    this.delete.emit(this.id);
  }

  createExpressionWithBrackets(): void {
    this.extend.emit(this.id);
  }
}
