import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LOCALE_ID, NgModule, isDevMode, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { LayoutModule } from '@angular/cdk/layout';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DeleteConfirmDialogComponent } from './components/delete-confirm-dialog/delete-confirm-dialog.component';
import { DeploymentFormComponent } from './components/deployment-form/deployment-form.component';
import { DeploymentListComponent } from './components/deployment-list/deployment-list.component';
import { DeploymentTagsComponent } from './components/deployment-tags/deployment-tags.component';
import { DeploymentComponent } from './components/deployment/deployment.component';
import { DeploymentFilterComponent } from './components/deployment-list/deployment-filter.component';
import { MapComponent } from './components/map/map.component';
import { NodeFormComponent } from './components/node-form/node-form.component';
import { NodeListComponent } from './components/node-list/node-list.component';
import { NodeComponent } from './components/node/node.component';
import { TagListComponent } from './components/tag-list/tag-list.component';
import { TagFormComponent } from './components/tag-form/tag-form.component';
import { EnvListComponent } from './components/env-list/env-list.component';
import { EnvFormComponent } from './components/env-form/env-form.component';
import { EnvFilterComponent } from './components/env-filter/env-filter.component';

import '@angular/common/locales/global/de';

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

@NgModule({
  declarations: [
    AppComponent,
    NodeListComponent,
    DeploymentListComponent,
    NodeFormComponent,
    DeploymentComponent,
    MapComponent,
    DeploymentFormComponent,
    DeploymentFilterComponent,
    DeploymentTagsComponent,
    DeleteConfirmDialogComponent,
    NodeComponent,
    TagListComponent,
    TagFormComponent,
    EnvListComponent,
    EnvFormComponent,
    EnvFilterComponent,
  ],
  imports: [
    BrowserModule,
    KeycloakAngularModule,
    HttpClientModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ReactiveFormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatGridListModule,
    MatSelectModule,
    MatDatepickerModule,
    MomentDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatChipsModule,
    MatExpansionModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatBottomSheetModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-CH' },
    { provide: MAT_DATE_LOCALE, useValue: 'de' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [ MAT_DATE_LOCALE ] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: ErrorStateMatcher, useClass: CustomMaterialFormsMatcher },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
