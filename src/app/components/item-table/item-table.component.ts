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
import { ItemType, timestampKeys } from 'src/app/common/menuType';
import { convertTime } from 'src/app/common/timeConverter';
import { CertTableComponent } from '../cert-table/cert-table.component';
import { JsonPipe, NgFor } from '@angular/common';
import { sortColumnForMenu } from 'src/app/common/sortMenuOrder';
import { SharedModule } from 'src/app/common/shared/shared.module';

@Component({
  selector: 'app-item-table',
  standalone: true,
  imports: [
    CertTableComponent,
    NgFor,
    SharedModule,
  ],
  templateUrl: './item-table.component.html',
  styleUrl: './item-table.component.css'
})
export class ItemTableComponent {
  @Input() itemType: ItemType = ItemType.None;
  @Input() item: any = {};
  @Input() showCertTables: boolean = false;
  @Input() activeCertificates: any[] = [];
  @Input() revokedCertificates: any[] = [];
  @Input() columnForMenu: {[key: string]: any} = {};
  @Input() serial: string | undefined = undefined;
  @Output() openXmlDialogCall = new EventEmitter<any>();
  @Output() downloadDocFileCall = new EventEmitter<any>();
  @Output() clickRevokeBtnCall = new EventEmitter<any>();
  @Output() clickDownloadBtnCall = new EventEmitter<any>();
  @Output() openCertModalCall = new EventEmitter();
  
  isTimestampFormat(key: string): boolean {
    return timestampKeys.includes(key);
  }

  convertTimeString = (time: string): string => {
    return convertTime(time);
  }

  sortColumnForMenu = (a: any, b: any) => {
    return sortColumnForMenu(a, b);
  }

  openXmlDialog = (event: any) => {
    this.openXmlDialogCall.emit(event);
  }

  downloadDocFile = (event: any) => {
    this.downloadDocFileCall.emit(event);
  }

  openCertModal = () => {
    this.openCertModalCall.emit();
  }

  clickRevokeBtn = (event: any) => {
    this.clickRevokeBtnCall.emit(event);
  }

  clickDownloadBtn = (event: any) => {
    this.clickDownloadBtnCall.emit(event);
  }
}
