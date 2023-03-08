import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { KeycloakProfile } from 'keycloak-js';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthenticationService } from './shared/authentication.service';
import pkgJson from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Mitwelten Deployments Manager';
  version = pkgJson.version;

  loggedIn: boolean;
  userData?: KeycloakProfile;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.authService.authStateSubject.subscribe(authState => this.loggedIn = authState);
    this.authService.userData().subscribe(profile => this.userData = profile);
    this.authService.checkLogin();
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

}
