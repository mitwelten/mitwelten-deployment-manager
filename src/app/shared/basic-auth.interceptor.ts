import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthenticationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // maybe only for data.mitwelten.org?
    if (this.authService.token !== null) {
      // this.authService.authStateSubject.next(true);
      request = request.clone({
        setHeaders: {
          Authorization: `Basic ${this.authService.token}`,
          Accept: 'application/json',
        }
      });
    }
    // else {
    //   this.authService.authStateSubject.next(false);
    // }
    return next.handle(request);
  }
}
