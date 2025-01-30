import { NgIf } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { TranslateService } from '@ngx-translate/core';
import { wktToGeoJSON } from '@terraformer/wkt';
import { NotifierService } from 'gramli-angular-notifier';
import { catchError, firstValueFrom, Observable, of, throwError } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ItemType } from 'src/app/common/menuType';
import { getMrnPrefixFromOrgMrn } from 'src/app/common/mrnUtil';
import { mustIncludePatternValidator } from 'src/app/common/mustIncludeValidator';
import { ItemManagerService } from 'src/app/common/shared/item-manager.service';
import { loadLang } from 'src/app/common/translateHelper';
import { ComponentsModule } from 'src/app/components/components.module';
import { G1128XmlInputComponent } from 'src/app/components/g1128-xml-input/g1128-xml-input.component';

@Component({
  selector: 'app-detail-view',
  standalone: true,
  imports: [
    NgIf,
    ComponentsModule,
    ClarityModule,
    G1128XmlInputComponent,
  ],
  templateUrl: './detail-view.component.html',
  styleUrl: './detail-view.component.css'
})
export class DetailViewComponent {
  isEditing: boolean = false;
  itemType: ItemType = ItemType.None;
  orgMrn: string = "";
  id: string = "";
  numberId = -1;
  instanceMrn = "";
  instanceVersion = "";
  mrnPrefix = "urn:mrn:";
  isLoading = true;
  isForNew = false;
  item: any = {};
  hasAdminPermission = false;
  serial = '';
  apiBase = 'ir';
  isVerified = false;
  private readonly notifier: NotifierService;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private itemManagerService: ItemManagerService,
    private notifierService: NotifierService,
    private translate: TranslateService,
    private authService: AuthService,
  ) {
    this.notifier = notifierService;
    loadLang(translate);
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams['edit'] === 'true') {
      this.isEditing = true;
    }
    if (queryParams['serial']) {
      this.serial = queryParams['serial'];
    }
    this.parseMyUrl().then(async () => {
      this.authService.getOrgMrn().then(orgMrn => {
        this.orgMrn = orgMrn;
        if (this.isForNew) {
          this.mrnPrefix = getMrnPrefixFromOrgMrn(orgMrn);
          this.isEditing = true;
          this.item = { mrn: this.mrnPrefix };
        } else {
          this.loadItem(this.orgMrn);
        }
        this.authService.hasPermission(this.itemType, orgMrn === this.id).then((hasPermission) => {
          if (this.itemType !== ItemType.Instance) {
            this.hasAdminPermission = hasPermission;
          }
        });
        if (this.itemType === ItemType.Instance) {
          this.apiBase = 'sr';
          this.hasAdminPermission = true;
        }
      }
      );
    });
  }

  parseMyUrl = (): Promise<void> => {
    return firstValueFrom(this.route.url).then(url => {
      if (url.length === 4) {
        this.instanceVersion = decodeURIComponent(url.pop()?.path || "");
      }
      this.id = decodeURIComponent(url.pop()?.path || "");

      const itemTypePath = url.pop()?.path;
      if (itemTypePath && Object.values(ItemType).includes(itemTypePath as ItemType)) {
        this.itemType = itemTypePath as ItemType;
      } else {
        throw new Error('Invalid ItemType conversion');
      }

      if (this.id === "new") {
        this.isForNew = true;
      }
      if (this.itemType === ItemType.Role) {
        this.numberId = parseInt(this.id);
      }
    });
  }

  loadItem = async (orgMrn: string) => {
    this.item = await this.itemManagerService.fetchSingleData(this.itemType, orgMrn, this.id, this.instanceVersion);
    if (this.itemType === ItemType.Instance && this.item) {
      this.numberId = parseInt(this.item.id);
    }
    console.log(this.item);
    this.isLoading = false;
  }

  edit = (item: any) => {
    if (!this.hasAdminPermission) {
      this.notifier.notify('error', this.translate.instant('error.resource.permissionError'));
      return;
    }
    this.loadItem(this.orgMrn);
    this.isEditing = true;
  }

  cancel = () => {
    this.isEditing = false;
  }

  submit = (item: any) => {
    if (!this.hasAdminPermission) {
      this.notifier.notify('error', this.translate.instant('error.resource.permissionError'));
      return;
    }
    this.submitDataToBackend(item, this.id);
  }

  submitDataToBackend(body: object, id?: string) {
    this.isLoading = true;
    if (id === "new") {
      this.itemManagerService.registerData(this.itemType, body, this.orgMrn).pipe(
        catchError(err => {
          return throwError(err);
        })
      ).subscribe(
        res => {
          this.notifier.notify('success', this.translate.instant('success.resource.create'));
          this.isLoading = false;
          this.router.navigateByUrl('/pages/' + this.apiBase + '/' + this.itemType);
        },
        err => {
          this.notifierService.notify('error',
            this.translate.instant('error.resource.creationFailed') + err.error.message);
          this.isLoading = false;
        },
        () => this.isLoading = false
      );
    } else if (id) {
      this.itemManagerService.updateData(this.itemType, body, this.orgMrn, id, this.instanceVersion, this.numberId).pipe(
        catchError(err => {
          return throwError(err);
        })
      ).subscribe(
        res => {
          this.notifier.notify('success', 'success.resource.update');
          this.isLoading = false;
          this.loadItem(this.orgMrn);
          this.isEditing = false;
        },
        err => {
          this.notifierService.notify('error',
            this.translate.instant('error.resource.updateFailed') + err.error.message);
          this.isLoading = false;
        }
      );
    }
  }

  revokeCerts = (certs: any[]) => {
    if (certs.length === 0) {
      this.notifier.notify('error', this.translate.instant('error.selection.noSelection'));
    } else {
      this.notifier.notify('success', this.translate.instant('success.certificate.revoke'));
    }
  }

  downloadCerts = (selected: any[]) => {
    if (selected.length === 0) {
      this.notifier.notify('error', this.translate.instant('error.selection.noSelection'));
    } else {
      this.notifier.notify('success', this.translate.instant('success.certificate.chosen'));
    }
  }

  back = () => {
    this.router.navigateByUrl('/pages/' + this.apiBase + '/' + this.itemType);
  }

  migrate = (newServiceMrn: string) => {
    this.itemManagerService.migrate(newServiceMrn, this.orgMrn, this.id, this.instanceVersion).subscribe(
      (res) => {
        // Handle successful response, e.g., process the certificate if needed
        this.notifier.notify('success', this.translate.instant('success.resource.migrate'));
        this.loadItem(this.orgMrn);
      },
      err => {
        this.notifier.notify('error', this.translate.instant('error.resource.migrate') + err.error.message);
      });
  }

  deleteItem = () => {
    if (!this.hasAdminPermission) {
      this.notifier.notify('error', this.translate.instant('error.resource.permissionError'));
      return;
    }
    this.itemManagerService.deleteData(this.itemType, this.orgMrn, this.id, this.instanceVersion, this.numberId).pipe(
      catchError(err => {
        return throwError(err);
      })
    ).subscribe(
      res => {
        this.notifier.notify('success', this.translate.instant('success.resource.delete'));
        this.router.navigateByUrl('/pages/' + this.apiBase + '/' + this.itemType);
      },
      err => {
        this.notifierService.notify('error',
          this.translate.instant('error.resource.deletionFailed') + err.error.message);
      }
    );
  }

  onVerify = (xmlString: string) => {
    this.itemManagerService.verifyG1128Xml(xmlString).subscribe({
      next: (res: any) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");
        const geometryAsWKT = xmlDoc.getElementsByTagName("geometryAsWKT")[0]?.textContent || '';
        console.log(geometryAsWKT);
        console.log(wktToGeoJSON(geometryAsWKT));
        this.notifier.notify('success', this.translate.instant('success.xml.verified'));
        this.item = {...this.item,
          name: res.name,
          version: res.version,
          serviceType: res.serviceType,
          status: res.status,
          endpointUri: res.endpoint,
          keywords: res.keywords,
          instanceId: res.id,
          implementsServiceDesign: res.implementsServiceDesign.id,
          implementsServiceDesignVersion: res.implementsServiceDesign.version,
          comment: res.description,
          instanceAsXmlName: xmlString,
          geometry: wktToGeoJSON(geometryAsWKT),
        };
        
        if (!new RegExp(this.mrnPrefix, 'i').test(res.id)) {
          this.notifier.notify('error', this.translate.instant('error.xml.idNotValid') + " : " + res.id);
        }
        
        this.isVerified = true;
      },
      error: err => {
        if (err.status === 400) {
          this.notifier.notify('error', this.translate.instant('error.xml.invalidXml'));
        } else {
          this.notifier.notify('error', err.message);
        }
      }
    });
  }
}
