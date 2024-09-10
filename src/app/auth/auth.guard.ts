import { Injectable } from "@angular/core";
import { Router, UrlTree } from "@angular/router";
import { KeycloakAuthGuard, KeycloakService } from "keycloak-angular";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  async isAccessAllowed(): Promise<boolean | UrlTree> {
    return true;
    /*
    if (!this.authenticated) {
      await this.router.navigate(['/login']);
    }
    return this.authenticated;
    */
  }
}