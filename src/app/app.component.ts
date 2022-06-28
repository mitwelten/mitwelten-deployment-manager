import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, mergeMap, shareReplay } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { AuthenticationService } from './shared/authentication.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Mitwelten: Nodes Deployment Manager'



  loggedIn: boolean;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.checkLogin();
    this.authService.authState.subscribe(authState => this.loggedIn = authState);
  }

  logout() {
    this.authService.logout();
  }

  private checkLogin() {
    this.authService.checkLogin().subscribe(state => {
      if (state.authenticated) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    });
  }
}
