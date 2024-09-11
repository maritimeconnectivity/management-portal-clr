import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private keycloakService: KeycloakService, private router: Router) {}

  public async login() {
    await this.keycloakService.login({
        redirectUri:'http://localhost:4200/pages'
    });
  }

  public async logout() {
    await this.keycloakService.logout();
  }

  public isAuthenticated(): Promise<boolean> {
    return Promise.resolve(this.keycloakService.isLoggedIn());
  }
}