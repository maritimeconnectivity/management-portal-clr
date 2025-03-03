import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AuthPermission, hasAdminPermissionInMIR, rolesToPermission } from './auth.permission';
import { ItemType, MCPComponentContext } from '../common/menuType';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role } from '../backend-api/identity-registry';
import { ItemManagerService } from '../common/shared/item-manager.service';
import RoleNameEnum = Role.RoleNameEnum;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();
  
  constructor(
    private keycloakService: KeycloakService, 
    private router: Router,
    private itemManagerService: ItemManagerService
  ) {}

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
    this.itemManagerService.clearRolesContext();
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

  public getUserPermission(rolesInOrg: RoleNameEnum[]): AuthPermission {
    if (!rolesInOrg || rolesInOrg.length === 0) {
      return AuthPermission.User;
    }
    return rolesToPermission(rolesInOrg);
  }

  public hasSiteAdminPermission(rolesInOrg: RoleNameEnum[]): boolean {
    return hasAdminPermissionInMIR(rolesToPermission(rolesInOrg), AuthPermission.SiteAdmin);
  }

  public hasPermission(context: ItemType, rolesInOrg: RoleNameEnum[], mcpcontext: MCPComponentContext, forMyOrg = false): boolean {
    this.protectFromEmptyToken();
    if (mcpcontext === MCPComponentContext.MSR) {
      return true;
    }

    if (!this.keycloakService.isLoggedIn()){
      return false;
    }
    
    const permission = this.getUserPermission(rolesInOrg);
    if (!permission) {
      return false;
    }
    if (hasAdminPermissionInMIR(permission, AuthPermission.SiteAdmin)) { // super admin
      return true;
    } else if (context === ItemType.User) {
      return (hasAdminPermissionInMIR(permission, AuthPermission.UserAdmin));
    } else if (context === ItemType.Device) {
      return (hasAdminPermissionInMIR(permission, AuthPermission.DeviceAdmin));
    } else if (context === ItemType.Vessel) {
      return (hasAdminPermissionInMIR(permission, AuthPermission.VesselAdmin));
    } else if (context === ItemType.MMS) {
      return (hasAdminPermissionInMIR(permission, AuthPermission.MMSAdmin));
    } else if (context === ItemType.Service) {
      return (hasAdminPermissionInMIR(permission, AuthPermission.ServiceAdmin));
    } else if (forMyOrg && context === ItemType.Organization || context === ItemType.Role) {
      // for my own organization management
      return (hasAdminPermissionInMIR(permission, AuthPermission.OrgAdmin));
    } else if (context === ItemType.Organization) {
      return (hasAdminPermissionInMIR(permission, AuthPermission.SiteAdmin));
    } else {
      return false;
    }
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