import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { map, Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard extends KeycloakAuthGuard {

  constructor(
    protected override router: Router,
    protected keycloakService: KeycloakService,
  ) {
    super(router, keycloakService)
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    if (!this.authenticated) {
      await this.keycloakService.login({
        redirectUri: window.location.origin + state.url,
      })
    }
    const requiredRoles = route.data['roles'];
    if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
      return true;
    }
    return requiredRoles.every(role => this.roles.includes(role))
  }
}
