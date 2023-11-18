import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, catchError, of, throttleTime } from 'rxjs';

import { DateFnsModule, MatDateFnsModule } from '@angular/material-date-fns-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';

// import { MapComponent } from '../map/map.component';
import { DataService, LocationService, NoOverlapValidator } from 'src/app/services';
import { CoordinatePoint, DeploymentFormValue, Node, UpsertDeployment, mapDeploymentFromValue } from 'src/app/shared';
import { DeleteConfirmDialogComponent } from '../../delete-confirm-dialog.component';
import { MapComponent } from '../../map.component';
import { DeploymentTagsComponent } from '../deployment-tags/deployment-tags.component';

@Component({
  selector: 'app-deployment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    DateFnsModule,
    MatDateFnsModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogClose,
    MatInputModule,
    DeploymentTagsComponent,
    MapComponent,
  ],
  templateUrl: './deployment-form.component.html',
  styleUrl: './deployment-form.component.css'
})
export class DeploymentFormComponent implements OnInit, AfterViewInit, OnDestroy {

  title?: string;
  mode: 'edit'|'add' = 'add';
  deletePending = false;
  coordinates: CoordinatePoint = { lon: 7.614704694445322, lat: 47.53603016174955 };

  nodes: Node[] | [] = [];
  tags: string[] = [];

  deploymentForm = new FormGroup({
    deployment_id: new FormControl<number|undefined>(undefined, Validators.required),
    node_id:       new FormControl<number|undefined>(undefined, Validators.required),
    period_start:  new FormControl<Date|null>(null),
    period_end:    new FormControl<Date|null>(null),
    lat:           new FormControl<number|null>(null, Validators.required),
    lon:           new FormControl<number|null>(null, Validators.required),
    description:   new FormControl<string|null>(null),
  });

  @ViewChild('deleteError') deleteErrorDialog?: TemplateRef<never>;
  @ViewChild(MatDatepicker) rangePicker?: MatDatepicker<Date>;
  @ViewChild(MapComponent) map?: MapComponent;

  displayCoordinates?: CoordinatePoint;
  mapSubscription?: Subscription;

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private locationService: LocationService,
    private noOverlapValidator: NoOverlapValidator
  ) {
    this.deploymentForm.setAsyncValidators([noOverlapValidator.validate.bind(noOverlapValidator)]);
  }

  ngOnInit(): void {

    this.title = 'Edit Deployment';
    this.mode = 'add';
    this.displayCoordinates = this.coordinates;

    if ('id' in this.route.snapshot.params) {
      const id = Number(this.route.snapshot.params['id']);
      this.dataService.getDeploymentById(id).subscribe(deployment => {
        if (deployment !== null) {

          const controls = this.deploymentForm.controls;
          this.title = `Edit Deployment (ID ${deployment.deployment_id})`;
          this.mode = 'edit';

          this.dataService.listNodes().subscribe(nodes => {
            this.nodes = nodes;
            controls.node_id.setValue(deployment.node.node_id ?? null);
          });

          this.tags = deployment.tags ? deployment.tags.map(t => t.name) : [];

          controls.deployment_id.setValue(deployment.deployment_id ?? null);
          if (deployment.period.start !== null) controls.period_start.setValue(deployment.period.start ? (new Date(deployment.period.start)) : null);
          if (deployment.period.end !== null) controls.period_end.setValue(deployment.period.end ? (new Date(deployment.period.end)) : null);

          this.displayCoordinates = deployment.location;

          controls.lat.setValue(deployment.location.lat);
          controls.lon.setValue(deployment.location.lon);

          controls.description.setValue(deployment.description ?? null);

          if (this.map !== undefined) {
            this.coordinates = deployment.location
          }
        } else {
          this.initializeAddMode();
        }
      });
    }
    else if ('node' in this.route.snapshot.params) {
      // configure deploy node mode (don't fetch nodes list)
      this.title = 'Deploy Node';
      this.dataService.getNodeById(Number(this.route.snapshot.params['node']))
        .subscribe(node => {
          if (node === null) {
            this.initializeAddMode();
          } else {
            this.title = `Deploy Node ${node.node_label}`;
            this.nodes = [node];
            this.deploymentForm.controls.deployment_id.clearValidators();
            this.deploymentForm.controls.deployment_id.updateValueAndValidity();
            this.deploymentForm.controls.lat.setValue(this.coordinates.lat);
            this.deploymentForm.controls.lon.setValue(this.coordinates.lon);
            this.deploymentForm.controls.node_id.setValue(node.node_id ??  null);
            this.deploymentForm.markAsTouched();
          }
        });
    }
    else {
      this.initializeAddMode();
    }
  }

  private initializeAddMode() {
    this.deploymentForm.controls.deployment_id.clearValidators();
    this.deploymentForm.controls.deployment_id.updateValueAndValidity();
    this.deploymentForm.controls.lat.setValue(this.coordinates.lat);
    this.deploymentForm.controls.lon.setValue(this.coordinates.lon);

    this.title = 'Add Deployment';
    this.dataService.listNodes().subscribe(nodes => this.nodes = nodes);
  }

  ngAfterViewInit(): void {
    this.mapSubscription = this.map?.coordinatesSet.asObservable().pipe(
      throttleTime(500)
    ).subscribe((coordinates: CoordinatePoint) => {
      this.deploymentForm.controls.lat.setValue(coordinates.lat);
      this.deploymentForm.controls.lon.setValue(coordinates.lon);
    });
  }

  editCoordinates(event: Event) {
    if ((event.target as HTMLInputElement).name === 'lat' && this.deploymentForm.controls.lon.value) {
      this.coordinates = {lat: Number((event.target as HTMLInputElement).value), lon: this.deploymentForm.controls.lon.value};
      this.deploymentForm.controls.lat.setValue(this.coordinates.lat);
    }
    if ((event.target as HTMLInputElement).name === 'lon' && this.deploymentForm.controls.lat.value) {
      this.coordinates = {lat: this.deploymentForm.controls.lat.value, lon: Number((event.target as HTMLInputElement).value)};
      this.deploymentForm.controls.lon.setValue(this.coordinates.lon);
    }
  }

  ngOnDestroy(): void {
    this.mapSubscription?.unsubscribe();
  }

  getLocation() {
    this.locationService.getLocation().subscribe(location => {
      if (location === false) {
        this.snackBar.open('Finding your location failed.', '😔', this.snackBarConfig)
      } else {
        this.coordinates = location;
        this.displayCoordinates = location;
        this.deploymentForm.controls.lat.setValue(location.lat);
        this.deploymentForm.controls.lon.setValue(location.lon);
      }
    });
  }

  submit() {
    const v = this.deploymentForm.value as DeploymentFormValue;
    const deployment: UpsertDeployment = mapDeploymentFromValue(v);
    this.dataService.putDeployment(deployment).subscribe(() => {
      this.deploymentForm.reset();
      this.router.navigate(['/deployments']);
    });
  }

  delete() {
    const deployment_id = this.deploymentForm.controls.deployment_id.value;
    if (deployment_id !== null) {
      const node = this.nodes.filter(n => n.node_id === this.deploymentForm.controls.node_id.value)[0];
      const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: {
          recordType: 'Deployment',
          recordLabel: `of Node ${node.node_label} (${node.type})`
        }
      });

      dialogRef.afterClosed().subscribe(response => {
        if (response === true) {
          this.deletePending = true;
          if (deployment_id) this.dataService.deleteDeployment(deployment_id).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 409) {
                this.dialog.open(this.deleteErrorDialog!, {
                  data: {
                    node_label: node.node_label,
                    node_type: node.type,
                    period_start: this.deploymentForm.controls.period_start.value,
                    period_end: this.deploymentForm.controls.period_end.value,
                  }
                });
              }
              return of(false);
          })).subscribe(response => {
            this.deletePending = false;
            if (response === true) {
              this.snackBar.open('Deployment deleted', '😬', this.snackBarConfig);
              this.router.navigate(['/deployments']);
            } else {
              this.snackBar.open('Deployment NOT deleted', '🙈', this.snackBarConfig);
            }
          });
        }
      });
    }
  }
}
