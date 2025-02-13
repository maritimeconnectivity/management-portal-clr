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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SmartTableComponent } from "../smart-table/smart-table.component";
import { ActiveCertificatesColumn, RevokedCertificatesColumn } from 'src/app/common/columnForCertificate';
import { ItemType } from 'src/app/common/menuType';

@Component({
  selector: 'app-cert-table',
  standalone: true,
  imports: [SmartTableComponent],
  templateUrl: './cert-table.component.html',
  styleUrl: './cert-table.component.css'
})
export class CertTableComponent {
  @Input() context: string = 'active';
  @Input() data: any[] = [];
  @Input() serial: string | undefined;
  @Output() onAdd:EventEmitter<any> = new EventEmitter<any>();
  @Output() onDownload:EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() onRevoke:EventEmitter<any[]> = new EventEmitter<any[]>();

  itemType: ItemType = ItemType.Certificate;

  download = (selected: any[]) => {
    this.onDownload.emit(selected);
  }

  add = () => {
    this.onAdd.emit();
  }

  revoke = (selected: any[]) => {
    this.onRevoke.emit(selected);
  }
  empty = [];

  columnsForActive = ActiveCertificatesColumn;
  columnsForRevoked = RevokedCertificatesColumn;
  
}
