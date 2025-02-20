import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AuthPermission, hasAdminPermissionInMIR, rolesToPermission } from './auth.permission';
import { ItemType } from '../common/menuType';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role } from '../backend-api/identity-registry';
import RoleNameEnum = Role.RoleNameEnum;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
  
  constructor(private keycloakService: KeycloakService, private router: Router) {}

  public async login() {
    const url = window.location;
    await this.keycloakService.login({
        redirectUri: url.protocol + '//' + url.host + '/pages'
    });

    // Check authentication status after login
    //this.isAuthenticated();
  }

  public setAuthenticated(isAuthenticated: boolean) {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  public async logout() {
    const url = window.location;
    await this.keycloakService.logout(url.protocol + '//' + url.host + '/login');
  }

  public async isAuthenticated(): Promise<boolean> {
    const authenticated = await this.keycloakService.isLoggedIn();
    this.setAuthenticated(authenticated);
    return Promise.resolve(authenticated);
  }

  public async getToken(): Promise<string> {
    this.protectFromEmptyToken();
    return this.keycloakService.getToken();
  }

  public async getOrgMrnFromToken(): Promise<string> {
    this.protectFromEmptyToken();
    return this.keycloakService.getKeycloakInstance().tokenParsed!["org"];
  }

  public async getUserNameFromToken(): Promise<string> {
    this.protectFromEmptyToken();
    return this.keycloakService.getKeycloakInstance().tokenParsed!["name"];
  }

  public async getUserMrnFromToken(): Promise<string> {
    this.protectFromEmptyToken();
    return this.keycloakService.getKeycloakInstance().tokenParsed!["mrn"];
  }

  public async getUserRolesFromToken(): Promise<RoleNameEnum[]> {
    this.protectFromEmptyToken();
    return this.keycloakService.getKeycloakInstance().tokenParsed!["roles"];
  }

  public async getUserPermissionsFromToken(): Promise<string[]> {
    this.protectFromEmptyToken();
    return this.keycloakService.getKeycloakInstance().tokenParsed!["permissions"];
  }

  public async getUserPermission(rolesInOrg: Role[]): Promise<AuthPermission> {
    this.protectFromEmptyToken();
    return new Promise<AuthPermission>(async (resolve, reject) => {
      let roles: RoleNameEnum[] = await this.getUserRolesFromToken() || [];
      const permissions = await this.getUserPermissionsFromToken() || [];
      if (!roles && !permissions) {
        resolve(AuthPermission.User);
        return ;
      }

      roles = Array.from(new Set([...roles, ...this.convertPermissionToRoles(permissions, rolesInOrg)]));
      const final: AuthPermission = rolesToPermission(roles);
      resolve(final);
    });
  }

  public async hasSiteAdminPermission(rolesInOrg: Role[]): Promise<boolean> {
    this.protectFromEmptyToken();
    return new Promise<boolean>(async (resolve, reject) => {
      let roles = await this.getUserRolesFromToken();
      const permissions = await this.getUserPermissionsFromToken();
      if (!roles || !permissions) {
        resolve(false);
        return ;
      }
      if (!roles) {
        roles = [];
      }
      roles = Array.from(new Set([...roles, ...this.convertPermissionToRoles(permissions, rolesInOrg)]));
      resolve(hasAdminPermissionInMIR(rolesToPermission(roles), AuthPermission.SiteAdmin));
    });
  }

  public async hasPermission(context: ItemType, rolesInOrg: Role[], forMyOrg = false): Promise<boolean> {
    this.protectFromEmptyToken();
    return new Promise<boolean>(async (resolve, reject) => {
      if (!this.keycloakService.isLoggedIn()){
        resolve(false);
        return ;
      }
        

      this.getUserPermission(rolesInOrg).then((permission) => {
        if (!permission) {
          resolve(false);
          return;
        }
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

  private convertPermissionToRoles(permission: string[], rolesInOrg: Role[]): RoleNameEnum[] {
    const roles: RoleNameEnum[] = [];
    for (const role of rolesInOrg) {
      if (permission.includes(role.permission)) {
        roles.push(role.roleName as RoleNameEnum);
      }
    }
    return roles;
  }

  private protectFromEmptyToken = () => {
    const tokenParsed = this.keycloakService.getKeycloakInstance().tokenParsed;
    if (!tokenParsed) {
      this.router.navigate(['/login']);
      throw new Error('User is not authenticated');
    }
  }
}