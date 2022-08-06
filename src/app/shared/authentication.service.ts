import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { DataService } from './data.service';

export interface Credentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public token: string = null;
  public currentCredentials: Observable<string>;
  public authStateSubject: BehaviorSubject<boolean>;
  public authState: Observable<boolean>;

  constructor(
    private router: Router,
    private dataService: DataService,
  ) {
    this.token = JSON.parse(localStorage.getItem('credentials') ?? 'null');

    this.authStateSubject = new BehaviorSubject<boolean>(false);
    this.authState = this.authStateSubject.asObservable();
  }

  login(credentials: Credentials): Observable<boolean> {
    this.token = btoa(`${credentials.username}:${credentials.password}`);
    return this.dataService.login().pipe(
      map(loggedIn => {
        if (loggedIn) {
          this.authStateSubject.next(true);
          localStorage.setItem('credentials', JSON.stringify(this.token));
        }
        return loggedIn;
      })
    );
  }

  logout() {
    localStorage.removeItem('credentials');
    this.authStateSubject.next(false);
    this.token = null;
    this.router.navigate(['/login']);
  }

  get isLoggedIn() {
    return this.authStateSubject.getValue();
  }

  // this should only be called by the error interceptor
  // and on app load in main component
  checkLogin() {
    if (this.authStateSubject.getValue()) {
      return of(true)
    } else if (this.token !== null) {
      return this.dataService.login();
    } else {
      return of(false);
    }
  }

}
