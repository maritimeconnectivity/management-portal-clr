import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private keycloakService: KeycloakService) {}

  public async login() {
    await this.keycloakService.login();
  }

  public async logout() {
    await this.keycloakService.logout();
  }

  public isAuthenticated(): Promise<boolean> {
    return Promise.resolve(this.keycloakService.isLoggedIn());
  }
}