import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AuthPermission, hasAdminPermissionInMIR, rolesToPermission } from './auth.permission';
import { ItemType } from '../common/menuType';

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

  public async getToken(): Promise<string> {
    return this.keycloakService.getToken();
  }

  public async getOrgMrn(): Promise<string> {
    return this.keycloakService.getKeycloakInstance().tokenParsed!["org"];
  }

  public async getUserName(): Promise<string> {
    return this.keycloakService.getKeycloakInstance().tokenParsed!["name"];
  }

  public async getUserMrn(): Promise<string> {
    return this.keycloakService.getKeycloakInstance().tokenParsed!["mrn"];
  }

  public async getUserRoles(): Promise<string[]> {
    return this.keycloakService.getKeycloakInstance().tokenParsed!["roles"];
  }

  public async getUserPermission(): Promise<AuthPermission> {
    return new Promise<AuthPermission>(async (resolve, reject) => {
      const roles = await this.keycloakService.getKeycloakInstance().tokenParsed!["roles"];
      resolve(rolesToPermission(roles));
    });
  }

  public async hasPermission(context: ItemType, forMyOrg: boolean = false): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      if (!this.keycloakService.isLoggedIn())
        resolve(false);
      this.getUserPermission().then((permission) => {
        if (hasAdminPermissionInMIR(permission, AuthPermission.SiteAdmin)) { // super admin
          resolve(true);
        } else if (context === ItemType.User) {
          resolve(hasAdminPermissionInMIR(permission, AuthPermission.UserAdmin));
        } else if (context === ItemType.Device) {
          resolve(hasAdminPermissionInMIR(permission, AuthPermission.DeviceAdmin));
        } else if (context === ItemType.Vessel) {
          resolve(hasAdminPermissionInMIR(permission, AuthPermission.VesselAdmin));
        } else if (context === ItemType.MMS) {
          resolve(hasAdminPermissionInMIR(permission, AuthPermission.MMSAdmin));
        } else if (context === ItemType.Service) {
          resolve(hasAdminPermissionInMIR(permission, AuthPermission.ServiceAdmin));
        } else if (forMyOrg && context === ItemType.Organization || context === ItemType.Role) {
          // for my own organization management
          resolve(hasAdminPermissionInMIR(permission, AuthPermission.OrgAdmin));
        } else if (context === ItemType.Organization) {
          resolve(hasAdminPermissionInMIR(permission, AuthPermission.SiteAdmin));
        } else {
          resolve(false);
        }
      });
    });
  }
}