import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthenticationService } from './shared/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Mitwelten Deployments Manager';

  loggedIn: boolean;

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
    this.authService.checkLogin();
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

}
