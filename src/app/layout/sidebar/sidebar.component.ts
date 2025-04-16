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

import { Component } from '@angular/core';
import { MENU_ITEMS } from 'src/app/pages/pages-menu';
import { TranslateService } from '@ngx-translate/core';
import { ClarityIcons, helpInfoIcon, lockIcon, layersIcon, networkGlobeIcon } from '@cds/core/icon';
import { AuthService } from 'src/app/auth/auth.service';
import { AppConfig } from 'src/app/app.config';
import { loadLang } from 'src/app/common/translateHelper';
import { ItemManagerService } from 'src/app/common/shared/item-manager.service';
import { Role } from 'src/app/backend-api/identity-registry';
ClarityIcons.addIcons(helpInfoIcon, lockIcon, layersIcon, networkGlobeIcon);
import RoleNameEnum = Role.RoleNameEnum;

@Component({
  selector: 'mp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  navGroups = MENU_ITEMS;
  isSiteAdmin = false;
  hasServiceRegistry = AppConfig.HAS_SERVICE_REGISTRY;
  constructor(
    translate: TranslateService,
    private authService: AuthService,
    private itemManagerService: ItemManagerService,
  ) {
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    loadLang(translate);
    if (!this.hasServiceRegistry)
    {
      this.navGroups = this.navGroups.filter((group) => group.title !== 'menu.sr');
    }
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.authService.getOrgMrnFromToken().then((orgMrn: string) => {
      this.itemManagerService.fetchMyRolesInOrg(orgMrn).then((rolesInOrg: RoleNameEnum[]) => {
        this.isSiteAdmin = this.authService.hasSiteAdminPermission(rolesInOrg) || this.authService.hasApproveOrgPermission(rolesInOrg);
      });
    });
  }
}
