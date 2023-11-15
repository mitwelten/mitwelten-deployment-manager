import { Injectable, computed, signal } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private authState = signal(false);
  private profile = signal<KeycloakProfile>({});

  public isLoggedIn = computed(() => this.authState());
  public userData = computed(() => this.profile());

  constructor(
    private keycloakService: KeycloakService
  ) { }

  // verify state and notify listeners on authStateSubject
  public checkLogin() {
    this.keycloakService.isLoggedIn().then(
      state => {
        this.authState.set(state);
        this.keycloakService.getKeycloakInstance().loadUserProfile().then(
          profile => this.profile.set(profile),
          error => console.error(error)
        );
      },
      error => {
        this.authState.set(false);
        this.profile.set({});
        console.error(error);
      }
    ).catch(error => console.error(error));
  }

  public login() {
    this.keycloakService.login();
  }

  public async logout() {
    await this.keycloakService.logout();
    this.keycloakService.clearToken();
  }

}
