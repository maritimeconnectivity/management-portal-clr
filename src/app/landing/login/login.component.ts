import { Component, Injectable, ViewChild } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from 'src/app/auth/auth.service';
import {NgIf} from "@angular/common";
import { ClrModal, ClrModalModule, ClrSelectModule } from '@clr/angular';
import { AppConfig } from 'src/app/app.config';
import { FormsModule } from '@angular/forms';
import { languages } from 'src/app/common/languages';
import { TranslateService } from '@ngx-translate/core';
import { addLangs, changeLang, loadLang } from 'src/app/common/translateHelper';
import { SharedModule } from 'src/app/common/shared/shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [
        NgIf,
        ClrSelectModule,
        FormsModule,
        SharedModule,
        ClrModalModule
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  @ViewChild('regInfoModal', { static: true }) regInfoModal: ClrModal | undefined;
  @ViewChild('regInputModal', { static: true }) regInputModal: ClrModal | undefined;
  
  langs = languages;
  footerLink = AppConfig.FOOTER_LINK;
  footerName = AppConfig.FOOTER_NAME;
  environmentName = AppConfig.ENVIRONMENT_NAME.toUpperCase();
  serviceProviderName = AppConfig.MP_NAME;
  currentLang = "en-GB";
  loggedIn = false;
  version = AppConfig.MP_VERSION;
  logo_img = AppConfig.LOGO_IMG;
  
  size = "lg";
  regInfoOpened = false;
  regInputOpened = false;
  
  constructor(private authService: AuthService,
    public translate: TranslateService,
  ) {
    addLangs(translate);
    this.currentLang = loadLang(translate);
  }
  
  ngOnInit(): void {
    this.updateLoggedIn();
  }

  updateLoggedIn() {
    this.authService.isAuthenticated().then(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  async logIn() {
    this.authService.login();
    this.updateLoggedIn();
  }

  async logOut() {
    this.authService.logout();
    this.updateLoggedIn();
  }

  async changeLang(lang: string) {
    console.log(`Changing language to ${lang}`);
    changeLang(this.translate, lang);
  }

  /**
   * it triggers opening the registration dialog up
   */
  createRegisterDialog() {
    //this.dialogService.open(RegisterDialogComponent);
  }

  /**
   * it triggers opening the process dialog up
   */
  createProcessDialog() {
    //this.dialogService.open(ProcessDialogComponent);
  }
  openRegInfoModal() {
    this.size = 'lg';

    this.regInfoModal?.open();
  }

  openRegInputModal() {
    this.size = 'lg';

    this.regInputModal?.open();
  }
}
