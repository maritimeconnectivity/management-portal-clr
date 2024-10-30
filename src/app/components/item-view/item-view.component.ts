import { Component, EventEmitter, Inject, Input, LOCALE_ID, Output, ViewChild } from '@angular/core';
import { ItemType, timestampKeys } from 'src/app/common/menuType';
import { CertTableComponent } from '../cert-table/cert-table.component';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { mrnRegex } from 'src/app/common/mrnRegex';
import { FormsModule, Validators } from '@angular/forms';
import { sortColumnForMenu } from 'src/app/common/sortMenuOrder';
import { formatDate, JsonPipe } from '@angular/common';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { convertTime } from 'src/app/common/timeConverter';
import { ClrDatepickerModule, ClrModal, ClrModalModule, ClrRadioModule } from '@clr/angular';
import { issueNewWithLocalKeys } from 'src/app/common/certificateUtil';
import { CertificateService } from 'src/app/common/shared/certificate.service';
import { AuthService } from 'src/app/auth/auth.service';
import { CertificateBundle } from 'src/app/common/certificateBundle';
import { NotifierService } from 'gramli-angular-notifier';
import { TranslateService } from '@ngx-translate/core';
import { FileHelperService } from 'src/app/common/shared/file-helper.service';
import { CertificateRevocation } from 'src/app/backend-api/identity-registry';
import { getReasonOptionFromRevocationReason, ReasonOption } from 'src/app/common/certRevokeInfo';
import { migrateVesselAttributes } from 'src/app/common/filterObject';

@Component({
  selector: 'app-item-view',
  standalone: true,
  imports: [
    SharedModule,
    ClrModalModule,
    ClrRadioModule,
    ClrDatepickerModule,
    CertTableComponent,
    FormsModule,
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
  @Output() onMigrate: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRefresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() onApprove: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDownloadCert: EventEmitter<any[]> = new EventEmitter<any[]>();
  @ViewChild('certModal', { static: true }) certModal: ClrModal | undefined;
  @ViewChild('revokeModal', { static: true }) revokeModal: ClrModal | undefined;
  @ViewChild('migrateModal', { static: true }) migrateModal: ClrModal | undefined;

  viewContext = 'detail';
  columnForMenu: {[key: string]: any} = {};
  itemId = "";
  activeCertificates: any[] = [];
  revokedCertificates: any[] = [];
  revokeModalOpened = false;
  certModalOpened = false;
  fromBrowser = true;
  revokeReason: ReasonOption | undefined = undefined;
  revokeReasons: ReasonOption[] = [];
  selectedActiveCerts: any[] = [];
  revokeAt : Date | undefined = undefined;
  reasonTitle = "";
  certificateBundle: CertificateBundle | undefined = undefined;
  migrateModalOpened = false;
  newServiceMrn = "";

  constructor(private certificateService: CertificateService,
    private translate: TranslateService,
    private notifier: NotifierService,
    private fileHelper: FileHelperService,
    authService: AuthService,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    for (const reason in CertificateRevocation.RevocationReasonEnum) {
      this.revokeReasons.push(getReasonOptionFromRevocationReason(reason.toLocaleLowerCase() as CertificateRevocation.RevocationReasonEnum));
    }
    this.revokeReasons.sort((a, b) => a.value.localeCompare(b.value));
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
      if (this.itemType === ItemType.Vessel) {
        this.item = migrateVesselAttributes(this.item);
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
    this.activeCertificates = [];
    this.revokedCertificates = [];
    certificates.sort((a, b) => a.start < b.start ? 1 : -1);
    certificates.map((cert: any) => {
      cert.revoked ? this.revokedCertificates.push(cert) : this.activeCertificates.push(cert)});
    this.revokedCertificates = this.updateRevokeReason(this.revokedCertificates);
  }

  updateRevokeReason = (revokedCerts: any[]): any[] => {
    return revokedCerts.map((cert) => ({ ...cert, revokeReason: this.revokeReasons.filter((reason) => reason.value === cert.revokeReason)[0].title }));
  }

  sortColumnForMenu = (a: any, b: any) => {
    return sortColumnForMenu(a, b);
  }

  edit = () => {
    this.onEdit.emit(this.item);
  }

  migrate = () => {
    this.onMigrate.emit(this.newServiceMrn);
  }

  approve = () => {
    this.onApprove.emit(this.item);
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
    if (this.itemType === ItemType.Service && this.instanceVersion) {
      this.notifier.notify('error', 'You need to migrate the service first.');
      return ;
    }
    this.certModal?.open();
    this.certModalOpened = true;
    this.issue();
  }

  issue = () => {
    issueNewWithLocalKeys(this.certificateService!, this.itemType, this.itemId, this.orgMrn, this.fromBrowser, this.instanceVersion).then((cert: CertificateBundle | undefined) => {
      this.certificateBundle = cert;
      this.notifier.notify('success', "A new " + this.itemType + " " + this.translate.instant('success.resource.create'));
    });
  }

  revokeCerts = (selected: any[]) => {
    // conversion to date object
    this.revokeAt = new Date(Date.parse(this.revokeAt!.toLocaleString()));
    const certificateRevocation: CertificateRevocation = {
      revokedAt: this.revokeAt,
      revocationReason: this.revokeReason?.value!,
    };
    
    selected.forEach((cert) => {
      this.certificateService.revokeCertificate(this.itemType, this.item.mrn, this.orgMrn, cert.serialNumber, certificateRevocation, this.instanceVersion)
      .subscribe((res) => {
        this.notifier.notify('success',
          'Certificate has been successfully revoked');
        this.cancel();
    }, (err) => {
      this.notifier.notify('error', 'success.resource.delete');
    })
    });
  }

  clickDownloadBtn = (selected: any[]) => {
    if (selected.length === 0) {
      this.notifier.notify('warning', 'success.resource.delete');
      return;
    }
    selected.forEach((certificate) => {
      const endText = formatDate(certificate.end, 'yyyy-MM-ddTHH-mm-ss', this.locale);
      this.fileHelper.downloadPemCertificate({certificate: certificate.certificate},
        this.item.mrn + '_exp_' + endText, this.notifier);
    });
  }

  clickRevokeBtn = (selected: any[]) => {
    if (this.itemType === ItemType.Service && this.instanceVersion) {
      this.notifier.notify('error', 'You need to migrate the service first.');
      return ;
    }
    if (selected.length === 0) {
      this.notifier.notify('warning', 'success.resource.delete');
      return;
    }
    this.revokeModalOpened = true;
    this.selectedActiveCerts = selected;
  }

  clickMigrateBtn = () => {
    this.migrateModal?.open();
    this.migrateModalOpened = true;
    this.newServiceMrn = this.item.mrn + ":" + this.instanceVersion;
  }

  cancel = () => {
    this.certModal?.close();
    this.certModalOpened = false;
    this.revokeModal?.close();
    this.revokeModalOpened = false;
    this.migrateModal?.close();
    this.migrateModalOpened = false;
    this.onRefresh.emit();
    this.newServiceMrn = "";
    this.certificateBundle = undefined;
  }

  public download() {
    if (this.certificateBundle) {
      this.fileHelper.downloadPemCertificate(this.certificateBundle, this.itemId, this.notifier);
      this.notifier.notify('success', 'Chosen certificate has downloaded');
    }
  }

  refreshData = () => {
    this.onRefresh.emit();
  }

  issueFromBrowser = () => {
    this.fromBrowser = true;
  }

  issueManualKeystore = () => {
    this.fromBrowser = false;
  }
  
  capitalize = (s: string): string => s[0].toUpperCase() + s.slice(1);
}
