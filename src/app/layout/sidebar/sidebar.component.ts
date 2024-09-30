import { Component } from '@angular/core';
import { MENU_ITEMS } from 'src/app/pages/pages-menu';
import { TranslateService } from '@ngx-translate/core';
import { ClarityIcons, helpInfoIcon, lockIcon, layersIcon, networkGlobeIcon } from '@cds/core/icon';
ClarityIcons.addIcons(helpInfoIcon, lockIcon, layersIcon, networkGlobeIcon);

@Component({
  selector: 'mp-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  navGroups = MENU_ITEMS;
  constructor(translate: TranslateService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en-GB');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en-GB');
  }
}
