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
