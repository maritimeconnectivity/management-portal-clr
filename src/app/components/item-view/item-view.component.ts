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
import { AuthService } from 'src/app/auth/auth.service';
import { CertificateBundle } from 'src/app/common/certificateBundle';
import { NotifierService } from 'gramli-angular-notifier';
import { TranslateService } from '@ngx-translate/core';
import { FileHelperService } from 'src/app/common/shared/file-helper.service';

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
  @Input() itemType: ItemType = ItemType.None;
  @Input() item: any = {};
  @Input() orgMrn: string = '';
  @Input() instanceVersion: string | undefined = undefined;
  @Output() onEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
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
  fromBrowser = false;
  certificateBundle: CertificateBundle | undefined = undefined;

  constructor(private certificateService: CertificateService,
    private translate: TranslateService,
    private notifier: NotifierService,
    private fileHelper: FileHelperService,
    authService: AuthService
  ) {
    authService.getOrgMrn().then((orgMrn) => {
      this.orgMrn = orgMrn;
    });
  }

  ngOnChanges(simpleChange: any) {
    if (!simpleChange.item || !simpleChange.item.currentValue)
      return;
    this.item = simpleChange.item.currentValue && simpleChange.item.currentValue;
    if (this.item && this.itemType === ItemType.Role) {
      this.itemId = this.item.id;
      this.setForm();
    } else if (this.item && this.item.mrn) {
      this.itemId = this.item.mrn;
      if (this.item.instanceVersion) {
        this.instanceVersion = this.item.instanceVersion;
      }
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

  deleteItem = () => {
    this.onDelete.emit(this.item);
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

  issue = () => {
    issueNewWithLocalKeys(this.certificateService!, this.itemType, this.itemId, this.orgMrn, this.fromBrowser, this.instanceVersion).then((cert: CertificateBundle | undefined) => {
      this.certificateBundle = cert;
      this.notifier.notify('success', "A new " + this.itemType + " " + this.translate.instant('success.resource.create'));
    });
  }

  cancel = () => {
    this.certModal?.close();
    this.certModalOpened = false;
    console.log("Modal closed");
  }

  public download() {
    if (this.certificateBundle) {
      this.fileHelper.downloadPemCertificate(this.certificateBundle, this.itemId, this.notifier);
      this.notifier.notify('success', 'Chosen certificate has downloaded');
    }
  }

  downloadCerts = (certs: any[]) => {
    this.onDownloadCert.emit(certs);
  }

  revokeCerts = (certs: any[]) => {
    this.onRevokeCert.emit(certs);
  }

  issueFromBrowser = () => {
    this.fromBrowser = true;
  }

  issueManualKeystore = () => {
    this.fromBrowser = false;
  }
  
  capitalize = (s: string): string => s[0].toUpperCase() + s.slice(1);
}
