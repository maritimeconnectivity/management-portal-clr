import { Component } from '@angular/core';
import { MENU_ITEMS } from 'src/app/pages/pages-menu';
import { TranslateService } from '@ngx-translate/core';
import { ClarityIcons, helpInfoIcon, lockIcon, layersIcon, networkGlobeIcon } from '@cds/core/icon';
import { AuthService } from 'src/app/auth/auth.service';
import { AppConfig } from 'src/app/app.config';
import { loadLang } from 'src/app/common/translateHelper';
ClarityIcons.addIcons(helpInfoIcon, lockIcon, layersIcon, networkGlobeIcon);

@Component({
  selector: 'mp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  navGroups = MENU_ITEMS;
  authService: AuthService;
  isSiteAdmin = false;
  hasServiceRegistry = AppConfig.HAS_SERVICE_REGISTRY;
  constructor(
    translate: TranslateService,
    authService: AuthService
  ) {
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    loadLang(translate);
    this.authService = authService;
    if (!this.hasServiceRegistry)
    {
      this.navGroups = this.navGroups.filter((group) => group.title !== 'menu.sr');
    }
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.authService.getUserRoles().then((roles) => {
      if (roles) {
        this.isSiteAdmin = roles.includes('ROLE_SITE_ADMIN');
      }
    });
  }
}
