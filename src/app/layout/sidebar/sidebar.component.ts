import { Component } from '@angular/core';
import { MENU_ITEMS } from 'src/app/pages/pages-menu';
import { TranslateService } from '@ngx-translate/core';
import { ClarityIcons, helpInfoIcon, lockIcon, layersIcon, networkGlobeIcon } from '@cds/core/icon';
import { AuthService } from 'src/app/auth/auth.service';
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
  constructor(
    translate: TranslateService,
    authService: AuthService
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en-GB');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en-GB');
    this.authService = authService;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.authService.getUserRoles().then((roles) => {
      this.isSiteAdmin = roles.includes('ROLE_SITE_ADMIN');
    });
  }
}
