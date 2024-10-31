import { Component, Injectable, ViewChild } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from 'src/app/auth/auth.service';
import {NgIf} from "@angular/common";
import { ClrAlert, ClrAlertModule, ClrDropdownModule, ClrModal, ClrModalModule, ClrSelectModule, ClrWizard, ClrWizardModule } from '@clr/angular';
import { AppConfig } from 'src/app/app.config';
import { FormsModule } from '@angular/forms';
import { languages } from 'src/app/common/languages';
import { TranslateService } from '@ngx-translate/core';
import { addLangs, changeLang, getLang, loadLang } from 'src/app/common/translateHelper';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { ItemType } from 'src/app/common/menuType';
import { Organization, OrganizationControllerService } from 'src/app/backend-api/identity-registry';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [
        NgIf,
        ClrSelectModule,
        FormsModule,
        SharedModule,
        ClrModalModule,
        ClrDropdownModule,
        ComponentsModule,
        ClrAlertModule,
        ClrWizardModule
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  @ViewChild('regInfoModal', { static: true }) regInfoModal: ClrModal | undefined;
  @ViewChild('wizard', { static: true }) wizard: ClrWizard | undefined;
  langs = languages;
  footerLink = AppConfig.FOOTER_LINK;
  footerName = AppConfig.FOOTER_NAME;
  environmentName = AppConfig.ENVIRONMENT_NAME.toUpperCase();
  serviceProviderName = AppConfig.MP_NAME;
  currentLang = "en-GB";
  currentLangName = "English";
  loggedIn = false;
  version = AppConfig.MP_VERSION;
  logo_img = AppConfig.LOGO_IMG;
  wizardOpen = false;
  termsOfUse = AppConfig.TERMS_OF_USE;
  size = "lg";
  regInfoOpened = false;
  regInputOpened = false;
  agreed = false;
  submitted = false;
  submissionFailed = false;
  nextText = "Agree";
  isForNew = true;
  itemType = ItemType.OrgCandidate;
  mrnPrefix = 'urn:mrn:mcp:org:'+AppConfig.IDP_NAMESPACE+':';
  item: Organization = {name: "", email: "", address: "", country: "", mrn: "", url: ""};
  contactEmail = "";
  adminEmail = AppConfig.MP_CONTACT;
  errMessage = "";
  
  constructor(private authService: AuthService,
    public translate: TranslateService,
    private organizationService: OrganizationControllerService,
  ) {
    addLangs(translate);
    this.loadLang();
    this.item.mrn = this.mrnPrefix;
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

  async loadLang() {
    this.currentLang = loadLang(this.translate);
    this.currentLangName = getLang(this.currentLang);
  }

  async changeLang(lang: string) {
    changeLang(this.translate, lang);
    this.loadLang();
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
    this.regInfoModal?.open();
  }

  openWizard(){
    this.wizard?.reset();
    this.wizard?.open();
    this.agreed = false;
    this.submitted = false;
    this.item = {name: "", email: "", address: "", country: "", mrn: this.mrnPrefix, url: ""};
  }

  agree(){
    this.agreed = true;
  }

  submit(item: Organization) {
    console.log(item);
    this.organizationService.applyOrganization(item).pipe(
      catchError(err => {
        return throwError(err);
      })
    ).subscribe(
      res => {
        this.contactEmail = item.email || "";
        this.submitted = true;
      },
      err => {
        this.submissionFailed = true;
        this.errMessage = err.error.message;
        console.log(err);
      }
    );    
  }

  doCustomClick(buttonType: string): void {
    if ('custom-next' === buttonType) {
      this.wizard?.next();
    }

    if ('custom-previous' === buttonType) {
      this.wizard?.previous();
    }
  }
}
