import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ItemType, timestampKeys } from 'src/app/common/menuType';
import { CertTableComponent } from '../cert-table/cert-table.component';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { mrnRegex } from 'src/app/common/mrnRegex';
import { Validators } from '@angular/forms';
import { sortColumnForMenu } from 'src/app/common/sortMenuOrder';
import { JsonPipe } from '@angular/common';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { convertTime } from 'src/app/common/timeConverter';
import { ClrModal, ClrModalModule, ClrRadioModule } from '@clr/angular';
import { issueNewWithLocalKeys } from 'src/app/common/certificateUtil';
import { CertificateService } from 'src/app/common/shared/certificate.service';

@Component({
  selector: 'app-item-view',
  standalone: true,
  imports: [
    SharedModule,
    ClrModalModule,
    ClrRadioModule,
    CertTableComponent,
    JsonPipe,
  ],
  templateUrl: './item-view.component.html',
  styleUrl: './item-view.component.css'
})
export class ItemViewComponent {
  @Input() itemType: ItemType = ItemType.Device;
  @Input() item: any = {};
  @Input() orgMrn: string = '';
  @Input() instanceVersion: string | undefined = undefined;
  @Output() onEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() onIssueCert: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRevokeCert: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() onDownloadCert: EventEmitter<any[]> = new EventEmitter<any[]>();
  @ViewChild('certModal', { static: true }) certModal: ClrModal | undefined;

  viewContext = 'detail';
  columnForMenu: {[key: string]: any} = {};
  itemId = "";
  activeCertificates: any[] = [];
  revokedCertificates: any[] = [];
  certModalOpened = false;
  options = [];
  certificateService: CertificateService | undefined;

  constructor(certificateServiceInject: CertificateService) {
    this.certificateService = certificateServiceInject;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }

  ngOnChanges(simpleChange: any) {
    this.item = simpleChange.item.currentValue && simpleChange.item.currentValue;
    if (Object.keys(this.item).length > 0) {
      this.itemId = this.item.mrn;
      this.setForm();
      if (this.item.certificates) {
        this.assignCertificatesByStatus(this.item.certificates);
      }
    }
  }

  setForm = () => {
    Object.entries(ColumnForResource[this.itemType.toString()]).map(([key, value]) => {
      if (!value.visibleFrom)
        return;
      if (value.visibleFrom && !value.visibleFrom.includes(this.viewContext))
        return;
      this.columnForMenu[key] = value;
    });
  }

  assignCertificatesByStatus = (certificates: any[]) => {
    certificates.map((cert: any) => {
      cert.revoked ? this.revokedCertificates.push(cert) : this.activeCertificates.push(cert)});
  }

  sortColumnForMenu = (a: any, b: any) => {
    return sortColumnForMenu(a, b);
  }

  edit = () => {
    this.onEdit.emit(this.item);
  }
  
  isTimestampFormat(key: string): boolean {
    return timestampKeys.includes(key);
  }

  convertTimeString = (time: string): string => {
    return convertTime(time);
  }

  openCertModal = () => {
    this.certModal?.open();
    this.certModalOpened = true;
  }

  locallyWManualKeystore(): void {
    issueNewWithLocalKeys(this.certificateService!, this.itemType, this.itemId, this.orgMrn, false, this.instanceVersion);
  }

  locallyFromBrowser(): void {
    issueNewWithLocalKeys(this.certificateService!, this.itemType, this.itemId, this.orgMrn, true, this.instanceVersion);
  }

  downloadCerts = (certs: any[]) => {
    this.onDownloadCert.emit(certs);
  }

  revokeCerts = (certs: any[]) => {
    this.onRevokeCert.emit(certs);
  }
  
  capitalize = (s: string): string => s[0].toUpperCase() + s.slice(1);
}
