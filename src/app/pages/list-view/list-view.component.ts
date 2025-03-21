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

import { Component, Input, ViewChild } from '@angular/core';
import { ComponentsModule } from 'src/app/components/components.module';
import { DeviceControllerService, OrganizationControllerService, Role, RoleControllerService, ServiceControllerService, ServicePatch, User, UserControllerService, VesselControllerService } from 'src/app/backend-api/identity-registry';
import { ItemType, MCPComponentContext } from 'src/app/common/menuType';
import { ActivatedRoute, Router } from '@angular/router';
import { SmartExpandableTableComponent } from 'src/app/components/smart-expandable-table/smart-expandable-table.component';
import { ClarityModule } from '@clr/angular';
import { ColumnForResource } from 'src/app/common/columnForMenu';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';
import { NotifierService } from 'gramli-angular-notifier';
import { InstanceControllerService } from 'src/app/backend-api/service-registry';
import { AuthService } from 'src/app/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ORG_ADMIN_AT_MIR } from 'src/app/common/variables';
import { ItemManagerService } from 'src/app/common/shared/item-manager.service';
import RoleNameEnum = Role.RoleNameEnum;

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [
    ClarityModule,
    ComponentsModule,
    SmartExpandableTableComponent],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.css'
})

export class ListViewComponent {
  @ViewChild(SmartExpandableTableComponent) exTable!: SmartExpandableTableComponent;
  @Input() itemType: ItemType = ItemType.None;
  orgMrn: string = "";
  data: any[] = [];
  labels: {[key: string]: any} = {};
  viewContext = 'list';
  totalPages = 0;
  totalElements = 0;
  hasEditPermission = false;
  apiBase = 'ir';
  private readonly notifier: NotifierService;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notifierService: NotifierService,
    private itemManagerService: ItemManagerService,
    private authService: AuthService,
    private translate: TranslateService
) {
    this.notifier = notifierService;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.parseMyUrl().then(() => {
      this.authService.getOrgMrnFromToken().then((orgMrn) => {
        this.orgMrn = orgMrn;
        this.setLabel();
        let mcpContext = MCPComponentContext.MIR;
        if (this.itemType === ItemType.Instance) {
          this.apiBase = 'sr';
          mcpContext = MCPComponentContext.MSR;
        }
        this.itemManagerService.fetchMyRolesInOrg(this.orgMrn).then((roles: RoleNameEnum[]) => {
          this.hasEditPermission = this.authService.hasPermission(this.itemType, roles, mcpContext);
        });
        
      });
    });
  }

  setLabel = () => {
    this.labels = this.filterVisibleForList(ColumnForResource[this.itemType.toString()]);
  }

  parseMyUrl = (): Promise<void> => {
    return firstValueFrom(this.route.url).then(url => {

      const itemTypePath = url.pop()?.path;
      if (itemTypePath && Object.values(ItemType).includes(itemTypePath as ItemType)) {
        this.itemType = itemTypePath as ItemType;
      } else {
        throw new Error('Invalid ItemType conversion');
      }

    }).catch((err) => {
      this.router.navigateByUrl('/pages/not-found');
    });
  }

  filterVisibleForList = (item: {[key: string]: any}) => {
    return Object.keys(item)
      .filter(key => item[key]?.visibleFrom?.includes('list'))
      .reduce((result, key) => {
        result[key] = item[key];
        return result;
      }, {} as {[key: string]: any});
  };

  fetchData = async (itemType: ItemType, pageNumber: number, elementsPerPage: number, secomSearchParam?: object) => {
    try {
      if (itemType === ItemType.Role) {
        return await this.itemManagerService.fetchAllRolesInOrg(this.orgMrn);
      }
      const fetchedItems = await this.itemManagerService.fetchListOfData(itemType, this.orgMrn, pageNumber, elementsPerPage, secomSearchParam);
      if (!fetchedItems) {
        return [];
      }
      this.totalPages = fetchedItems.totalPages!;
      this.totalElements = fetchedItems.totalElements!;
      return fetchedItems.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }
  
  onDelete = async (selected: any[]) => {
    const handleError = (err: any) => {
      if (err.status === 403) {
        this.notifier.notify('error', this.translate.instant('error.resource.permissionError'));
      } else {
        this.notifier.notify('error', this.translate.instant('error.resource.deletionFailed') + (err.error?.message || err.message));
      }
      throw err;
    };

    if (selected.length === 0) {
      this.notifier.notify('error', this.translate.instant('error.selection.noSelection'));
    } else if (!this.hasEditPermission) {
      this.notifier.notify('error', this.translate.instant('error.resource.permissionError'));
    } else {
      await selected.forEach(async (item) => {
        await this.itemManagerService.deleteData(this.itemType, this.orgMrn, item.mrn, item.instanceVersion, item.id && parseInt(item.id)).pipe(
          catchError(err => {
            handleError(err);
            return throwError(err);
          })).subscribe(res=> {
            this.notifier.notify('success', this.translate.instant('success.resource.delete'));
            this.refreshData();
            if (this.exTable?.expanded) {
              // when delete has done in item view
              this.exTable?.back();
            }
          });
      });
    }
  }

  onAdd = () => {
    if (!this.hasEditPermission) {
      this.notifier.notify('error', this.translate.instant('error.resource.permissionError'));
    } else {
      this.router.navigateByUrl('/pages/' + this.apiBase + '/'+this.itemType+'/new');
    }
  }

  refreshData = () => {
    this.exTable?.loadData();
  }

  edit = (selectedItem: any) => {
    // user can edit for their own organization
    if (this.itemType === ItemType.Organization && selectedItem.mrn === this.orgMrn) {
      if (!this.hasEditPermission) {
        this.notifier.notify('error', this.translate.instant('error.resource.permissionError'));
        return ;
      }
      this.moveToEditPage(selectedItem);
    }
    if (!this.hasEditPermission) {
      this.notifier.notify('error', this.translate.instant('error.resource.permissionError'));
      return ;
    } 
    this.moveToEditPage(selectedItem);
  }

  view = (selectedItem: any) => {
    this.moveToEditPage(selectedItem, false);
  }

  moveToEditPage = (selectedItem: any, forEdit: boolean = true) => {
    let url = '';
    if (this.itemType === ItemType.Role) {
      url = '/pages/' + this.apiBase + '/'+this.itemType+'/'+selectedItem.id;
    } else if (this.itemType === ItemType.Instance || this.itemType === ItemType.SearchObjectResult) {
      url = '/pages/' + this.apiBase + '/'+this.itemType+'/'+selectedItem.instanceId + '/' + selectedItem.version;
    } else if (this.itemType === ItemType.Service) {
      if (selectedItem.instanceVersion) {
        url = '/pages/' + this.apiBase + '/'+this.itemType+'/'+selectedItem.mrn+'/'+selectedItem.instanceVersion; //backward compatibility
      } else {
        url = '/pages/' + this.apiBase + '/'+this.itemType+'/'+selectedItem.mrn;
      }
    } else {
      url = '/pages/' + this.apiBase + '/'+this.itemType+'/'+selectedItem.mrn;
    }
    const urlTree = this.router.createUrlTree([url], {
      queryParams: { edit: forEdit }
    });
    this.router.navigateByUrl(urlTree);
  }

  migrate = (service: any) => {
    this.itemManagerService.migrate(service.newServiceMrn, this.orgMrn, service.mrn, service.instanceVersion).subscribe(
      (res) => {
        // Handle successful response, e.g., process the certificate if needed
        this.notifier.notify('success', this.translate.instant('success.resource.migrate'));
        this.refreshData();
      },
      err => {
        this.notifier.notify('error', this.translate.instant('error.resource.migrate'));
      });
  }

  approve = (selectedItem: any) => {
    this.itemManagerService.approve(selectedItem.mrn).subscribe(
      (res) => {
        this.notifier.notify('success', this.translate.instant('success.resource.approveOrganization'));
        this.createAdminRole(selectedItem.mrn).subscribe(
          (res) => {
            this.notifier.notify('success', this.translate.instant('success.resource.approveOrganization.role') + ' - ' + ORG_ADMIN_AT_MIR);
            this.createAdminUser(selectedItem.mrn, selectedItem.adminUser).subscribe(
              (res) => {
                this.notifier.notify('success', this.translate.instant('success.resource.approveOrganization.user') + ' - ' + selectedItem.adminUser.mrn);
                this.router.navigateByUrl('/pages/' + this.apiBase + '/organization');
              },
              err => {
                this.notifier.notify('error', this.translate.instant('error.resource.approveOrganization.userCreation') + err.error?.message);
              }
            );
          },
          err => {
            this.notifier.notify('error', this.translate.instant('error.resource.approveOrganization.roleCreation') + err.error?.message);
          });
        
      },
      err => {
        this.notifier.notify('error', this.translate.instant('error.resource.approveOrganization.general') + err.error?.message);
      });
  }

  createAdminRole(orgMrn: string) {
    const role: Role = {
      permission: ORG_ADMIN_AT_MIR, // TODO is this correct? Revise when creating the new role-functionality
      roleName: Role.RoleNameEnum.ORGADMIN,
    };
    return this.itemManagerService.createRole(role, orgMrn);
  }

  createAdminUser(orgMrn: string, user: User) {
    if (!user) {
      throw new Error(this.translate.instant('error.resource.noUser'));
    }
    // Set the user's permissions to the new role
    user.permissions = ORG_ADMIN_AT_MIR;
		return this.itemManagerService.createUser(user, orgMrn);
	}
}
