import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID, importProvidersFrom, isDevMode } from '@angular/core';
import { DateFnsAdapter, MAT_DATE_FNS_FORMATS } from '@angular/material-date-fns-adapter';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { FormControl } from '@angular/forms';
import { routes } from './app.routes';

import '@angular/common/locales/global/de'; // for date pipe
import { de } from 'date-fns/locale'; // for date adapter / date picker
import { authErrorInterceptor } from './auth/auth-error.interceptor';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'https://auth.mitwelten.org/auth',
        realm: 'mitwelten',
        clientId: 'walk'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html'
      }
    });
}

export class CustomMaterialFormsMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
      return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      // withDebugTracing(),
      withRouterConfig({onSameUrlNavigation: 'reload'})
    ),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    }),
    provideHttpClient(
      withInterceptors([authErrorInterceptor]),
      withInterceptorsFromDi(),
    ),
    importProvidersFrom(KeycloakAngularModule),
    { provide: LOCALE_ID, useValue: 'de-CH' },
    { provide: MAT_DATE_LOCALE, useValue: de },
    { provide: DateAdapter, useClass: DateFnsAdapter, deps: [ MAT_DATE_LOCALE ] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FNS_FORMATS },
    { provide: ErrorStateMatcher, useClass: CustomMaterialFormsMatcher },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
  ]
};
