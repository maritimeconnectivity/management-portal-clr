import { Component, EventEmitter, Inject, Input, LOCALE_ID, Output, ViewChild } from '@angular/core';
import { ItemType, timestampKeys } from 'src/app/common/menuType';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { FormsModule, Validators } from '@angular/forms';
import { sortColumnForMenu } from 'src/app/common/sortMenuOrder';
import { formatDate, JsonPipe } from '@angular/common';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { ClrDatepickerModule, ClrModal, ClrModalModule, ClrRadioModule, ClrSpinnerModule, ClrTextareaModule } from '@clr/angular';
import { issueNewWithLocalKeys } from 'src/app/common/certificateUtil';
import { CertificateService } from 'src/app/common/shared/certificate.service';
import { AuthService } from 'src/app/auth/auth.service';
import { CertificateBundle } from 'src/app/common/certificateBundle';
import { NotifierService } from 'gramli-angular-notifier';
import { TranslateService } from '@ngx-translate/core';
import { FileHelperService } from 'src/app/common/shared/file-helper.service';
import { CertificateRevocation, Role } from 'src/app/backend-api/identity-registry';
import { getReasonOptionFromRevocationReason, ReasonOption } from 'src/app/common/certRevokeInfo';
import { migrateVesselAttributes } from 'src/app/common/filterObject';
import { ItemFormComponent } from '../item-form/item-form.component';
import { getMrnPrefixFromOrgMrn } from 'src/app/common/mrnUtil';
import { ORG_ADMIN_AT_MIR } from 'src/app/common/variables';
import { ItemTableComponent } from "../item-table/item-table.component";
import { InputGeometryComponent } from '../input-geometry/input-geometry.component';

@Component({
  selector: 'app-item-view',
  standalone: true,
  imports: [
    SharedModule,
    ClrModalModule,
    ClrRadioModule,
    ClrSpinnerModule,
    ClrDatepickerModule,
    ItemFormComponent,
    InputGeometryComponent,
    FormsModule,
    ClrTextareaModule,
    ItemTableComponent
],
  templateUrl: './item-view.component.html',
  styleUrl: './item-view.component.css'
})
export class ItemViewComponent {
  @Input() itemType: ItemType = ItemType.None;
  @Input() item: any = {};
  @Input() orgMrn: string = '';
  @Input() mrnPrefix: string = 'urn:mrn:';
  @Input() instanceVersion: string | undefined = undefined;
  @Input() serial: string | undefined = undefined;
  @Input() isLoading: boolean = true;
  @Output() onEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() onMigrate: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRefresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() onApprove: EventEmitter<any> = new EventEmitter<any>();
  @Output() onDownloadCert: EventEmitter<any[]> = new EventEmitter<any[]>();
  @ViewChild('certModal', { static: true }) certModal: ClrModal | undefined;
  @ViewChild('revokeModal', { static: true }) revokeModal: ClrModal | undefined;
  @ViewChild('migrateModal', { static: true }) migrateModal: ClrModal | undefined;
  @ViewChild('xmlModal', { static: true }) xmlModal: ClrModal | undefined;
  @ViewChild(ItemFormComponent) newAdminUserForm: ItemFormComponent | undefined;

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
  userItemType = ItemType.User;
  adminUser: any = {permissions: ORG_ADMIN_AT_MIR };
  adminUserMrnPrefix = 'urn:mrn:mcp:';
  xmlModalOpened = false;
  xmlContent = "";
  showCertTables = false;
  geometry: any[] = [];
  geometryNames: string[] = [];

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
    } else if (this.item && this.itemType === ItemType.Instance) {
      this.itemId = this.item.instanceId;
      this.instanceVersion = this.item.instanceVersion;
      this.geometry = [...this.geometry, this.item.geometry];
      this.geometryNames = [this.item.name];
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
    if (this.itemType === ItemType.OrgCandidate) {
      this.adminUserMrnPrefix = getMrnPrefixFromOrgMrn(this.item.mrn);
    }
    this.checkIfShowCertTables();
  }

  checkIfShowCertTables = () => {
    if (this.itemType === ItemType.Role || this.itemType === ItemType.OrgCandidate || this.itemType === ItemType.Instance) {
      this.showCertTables = false;
    } else {
      this.showCertTables = true;
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

  edit = () => {
    this.onEdit.emit(this.item);
  }

  migrate = () => {
    this.onMigrate.emit(this.newServiceMrn);
  }

  approve = () => {
    if (this.newAdminUserForm?.isValid()) {
      this.adminUser = this.newAdminUserForm?.getFormValue();
      this.onApprove.emit({...this.item, adminUser: this.adminUser});
    }
  }

  deleteItem = () => {
    this.onDelete.emit(this.item);
  }

  openCertModal = () => {
    if (this.itemType === ItemType.Service && this.instanceVersion) {
      this.notifier.notify('error', this.translate.instant('error.form.requiremigrate'));
      return ;
    }
    this.certModal?.open();
    this.certModalOpened = true;
    this.issue();
  }

  openXmlDialog = (xml: any, isEditing: boolean = false) => {
    this.xmlModalOpened = true;
    this.xmlModal?.open();
    this.xmlContent = xml.content;
  }

  downloadDocFile = (doc: any) => {
    this.downloadFile(doc.name, doc.filecontentContentType, doc.filecontent);
  }

  downloadFile(filename: string, type: string, data: string) {
    // decode base64 string, remove space for IE compatibility
    var binary = atob(data.replace(/\s/g, ''));
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }

    var blob = new Blob([view], {type: type});
    var elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

  issue = () => {
    issueNewWithLocalKeys(this.certificateService!, this.itemType, this.itemId, this.orgMrn, this.fromBrowser, this.instanceVersion).then((cert: CertificateBundle | undefined) => {
      this.certificateBundle = cert;
      this.notifier.notify('success', this.translate.instant('success.resource.create'));
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
        this.notifier.notify('success', this.translate.instant('success.certificate.revoke'));
        this.cancel();
    }, (err) => {
      this.notifier.notify('error', this.translate.instant('error.certificate.revoke'));
    })
    });
  }

  clickDownloadBtn = (selected: any[]) => {
    if (selected.length === 0) {
      this.notifier.notify('warning', this.translate.instant('error.selection.noSelection'));
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
      this.notifier.notify('error', this.translate.instant('error.form.requiremigrate'));
      return ;
    }
    if (selected.length === 0) {
      this.notifier.notify('warning', this.translate.instant('error.selection.noSelection'));
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
      this.notifier.notify('success', this.translate.instant('success.certificate.chosen'));
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
