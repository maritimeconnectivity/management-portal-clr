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

import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClarityIcons, crownIcon, sunIcon, moonIcon } from '@cds/core/icon';
import { ClrInput } from '@clr/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth/auth.service';
import { languages } from 'src/app/common/languages';
import { loadTheme, storeTheme } from 'src/app/common/themeHelper';
import { changeLang, getLang, loadLang } from 'src/app/common/translateHelper';
ClarityIcons.addIcons(crownIcon, sunIcon, moonIcon);

@Component({
  selector: 'mp-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  role:string = 'admin';
  userName: string = 'admin';
  theme = 'light';
  counterTheme = 'dark';
  currentLang = "en-GB";
  currentLangName = "English";
  myMrn = '';
  langs = languages;

  constructor(private authService: AuthService,
    public translate: TranslateService,
    private router: Router
  ) {
    this.authService.getUserName().then((userName) => {
      this.userName = userName;
    });
    this.authService.getUserMrn().then((myMrn) => {
      this.myMrn = myMrn;
    });
    this.theme = loadTheme();
    this.counterTheme = this.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('cds-theme', this.theme);

    this.loadLang();
  }

  loadLang() {
    this.currentLang = loadLang(this.translate);
    this.currentLangName = getLang(this.currentLang);
  }

  async logOut() {
    this.authService.logout();
  }

  async changeLang(lang: string) {
    changeLang(this.translate, lang);
    this.loadLang();
  }

  goHome() {
    this.router.navigateByUrl('/pages');
  }

  goMyPage() {
    this.router.navigateByUrl('/pages/ir/user/'+this.myMrn);
  }

  toggleTheme() {
    this.theme =  this.theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('cds-theme', this.theme);
    storeTheme(this.theme);
    this.counterTheme = this.theme === 'dark' ? 'light' : 'dark';
  }
}
