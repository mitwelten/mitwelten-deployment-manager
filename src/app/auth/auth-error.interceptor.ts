import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthenticationService } from '../services';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        inject(AuthenticationService).logout();
      }
      const error = err.error.message || err.statusText;
      return throwError(() => new Error(error));
    })
  );
};
