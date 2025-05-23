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

import {Component, EventEmitter, Inject, Input, LOCALE_ID, Output, ViewChild, OnChanges} from '@angular/core';
import { ItemType, itemTypeToString } from 'src/app/common/menuType';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { FormsModule } from '@angular/forms';
import { formatDate } from '@angular/common';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { ClarityModule, ClrDatepickerModule, ClrModal, ClrModalModule, ClrRadioModule, ClrSpinnerModule, ClrTextareaModule } from '@clr/angular';
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
import { ItemFormComponent } from '../item-form/item-form.component';
import { getMrnPrefixFromOrgMrn, isUserEditingTheirOwnData } from 'src/app/common/mrnUtil';
import { ORG_ADMIN_AT_MIR } from 'src/app/common/variables';
import { ItemTableComponent } from "../item-table/item-table.component";
import { InputGeometryComponent } from '../input-geometry/input-geometry.component';
import { preprocessToShow } from 'src/app/common/itemPreprocessor';
import { loadLang } from 'src/app/common/translateHelper';

@Component({
  selector: 'app-item-view',
  standalone: true,
  imports: [
    SharedModule,
    ClarityModule,
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
export class ItemViewComponent implements OnChanges {
  @Input() itemType: ItemType = ItemType.None;
  @Input() item: any = {};
  @Input() orgMrn = '';
  @Input() mrnPrefix = 'urn:mrn:';
  @Input() instanceVersion: string | undefined = undefined;
  @Input() serial: string | undefined = undefined;
  @Input() isLoading = true;
  @Input() viewOnly = false;
  @Input() noMap = false;
  @Input() hasEditPermission = false;
  @Output() editEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() migrateEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() approveEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() downloadCertEvent: EventEmitter<any[]> = new EventEmitter<any[]>();
  @ViewChild('certModal', { static: true }) certModal: ClrModal | undefined;
  @ViewChild('revokeModal', { static: true }) revokeModal: ClrModal | undefined;
  @ViewChild('migrateModal', { static: true }) migrateModal: ClrModal | undefined;
  @ViewChild('xmlModal', { static: true }) xmlModal: ClrModal | undefined;
  @ViewChild(ItemFormComponent) newAdminUserForm: ItemFormComponent | undefined;

  viewContext = 'detail';
  columnForMenu: Record<string, any> = {};
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
    private authService: AuthService,
    @Inject(LOCALE_ID) public locale: string,
  ) {
    for (const reason in CertificateRevocation.RevocationReasonEnum) {
      this.revokeReasons.push(getReasonOptionFromRevocationReason(reason.toLocaleLowerCase() as CertificateRevocation.RevocationReasonEnum));
    }
    this.revokeReasons.sort((a, b) => a.value.localeCompare(b.value));
    authService.getOrgMrnFromToken().then((orgMrn) => {
      this.orgMrn = orgMrn;
    });

    loadLang(translate);
  }

  ngOnChanges(simpleChange: any) {
    if (!simpleChange.item || !simpleChange.item.currentValue)
      return;

    this.item = simpleChange.item.currentValue && simpleChange.item.currentValue;

    // give permission when user access their own profile
    if (this.itemType === ItemType.User && !this.hasEditPermission) {
      this.authService.getUserMrnFromToken().then((userMrn) => {
        if (isUserEditingTheirOwnData(this.item.mrn, userMrn)) {
          this.hasEditPermission = true;
        }
      });
    }

    if (this.item && this.itemType === ItemType.Role) {
      this.itemId = this.item.id;
      this.setForm();
    } else if (this.item && this.itemType === ItemType.Instance || this.itemType === ItemType.SearchObjectResult) {
      this.itemId = this.item.instanceId;
      this.instanceVersion = this.item.instanceVersion;
      this.geometry = [...this.geometry, this.item.geometry];
      this.geometryNames = [this.item.name];
      this.item = preprocessToShow(this.item, this.itemType);
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
    if (this.itemType === ItemType.Role || this.itemType === ItemType.OrgCandidate || this.itemType === ItemType.Instance || this.itemType === ItemType.SearchObjectResult) {
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

  onEdit = () => {
    this.editEvent.emit(this.item);
  }

  migrate = () => {
    this.migrateEvent.emit(this.newServiceMrn);
  }

  approve = () => {
    if (this.newAdminUserForm?.isValid()) {
      this.adminUser = this.newAdminUserForm?.getFormValue();
      // if the admin user's email conflicts with the org email, show error
      if (this.item.email === this.adminUser.email) {
        this.notifier.notify('error', this.translate.instant('error.user.emailConflict'));
        return;
      }

      this.approveEvent.emit({...this.item, adminUser: this.adminUser});
    }
  }

  deleteItem = () => {
    this.deleteEvent.emit(this.item);
  }

  openCertModal = () => {
    if (this.itemType === ItemType.Service && this.instanceVersion) {
      this.notifier.notify('error', this.translate.instant('error.selection.notMigrated'));
      return ;
    }
    this.certModal?.open();
    this.certModalOpened = true;
    this.issue();
  }

  openXmlDialog = (xml: any, isEditing = false) => {
    this.xmlModalOpened = true;
    this.xmlModal?.open();
    this.xmlContent = xml.content;
  }

  downloadDocFile = (doc: any) => {
    this.downloadFile(doc.name, doc.filecontentContentType, doc.filecontent);
  }

  downloadFile(filename: string, type: string, data: string) {
    // decode base64 string, remove space for IE compatibility
    const binary = atob(data.replace(/\s/g, ''));
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([view], {type: type});
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

  issue = () => {
    issueNewWithLocalKeys(this.certificateService!, this.itemType, this.itemId, this.orgMrn, this.fromBrowser).then((cert: CertificateBundle | undefined) => {
      this.certificateBundle = cert;
      this.notifier.notify('success', this.translate.instant('success.certificate.issue'));
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
        this.onCancel();
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
        this.item.mrn + '_exp_' + endText);
    });
  }

  clickRevokeBtn = (selected: any[]) => {
    if (this.itemType === ItemType.Service && this.instanceVersion) {
      this.notifier.notify('error', this.translate.instant('error.selection.notMigrated'));
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

  onCancel = () => {
    this.certModal?.close();
    this.certModalOpened = false;
    this.revokeModal?.close();
    this.revokeModalOpened = false;
    this.migrateModal?.close();
    this.migrateModalOpened = false;
    this.refreshEvent.emit();
    this.newServiceMrn = "";
    this.certificateBundle = undefined;
  }

  public onDownload() {
    if (this.certificateBundle) {
      this.fileHelper.downloadPemCertificate(this.certificateBundle, this.itemId);
      this.notifier.notify('success', this.translate.instant('success.certificate.chosen'));
    }
  }

  issueFromBrowser = () => {
    this.fromBrowser = true;
  }

  issueManualKeystore = () => {
    this.fromBrowser = false;
  }

  getItemTypeTitle = (itemType: ItemType) => {
    return itemTypeToString(itemType);
  }
}
