import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar, MatLegacySnackBarConfig as MatSnackBarConfig } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, Subscription, throttleTime } from 'rxjs';
import {
  CoordinatePoint, DataService, LocationService, Node, NoOverlapValidator
} from 'src/app/shared';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { MapComponent } from '../map/map.component';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment, Moment} from 'moment';
const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-deployment-form',
  templateUrl: './deployment-form.component.html',
  styleUrls: ['./deployment-form.component.css']
})
export class DeploymentFormComponent implements OnInit, AfterViewInit, OnDestroy {

  title: string;
  mode: 'edit'|'add' = 'add';
  deletePending = false;
  coordinates: CoordinatePoint = { lon: 7.614704694445322, lat: 47.53603016174955 };

  nodes: Node[] | [] = [];

  deploymentForm = new FormGroup({
    deployment_id: new FormControl<number|null>(null, Validators.required),
    node_id:       new FormControl<number|null>(null, Validators.required),
    period_start:  new FormControl<Moment|null>(null),
    period_end:    new FormControl<Moment|null>(null),
    lat:           new FormControl<number|null>(null, Validators.required),
    lon:           new FormControl<number|null>(null, Validators.required),
    description:   new FormControl<string|null>(null),
  });

  displayCoordinates: CoordinatePoint | undefined;

  @ViewChild('deleteError') deleteErrorDialog: TemplateRef<any>;
  @ViewChild(MatDatepicker) rangePicker: MatDatepicker<Moment> | undefined;
  @ViewChild(MapComponent) map: MapComponent | undefined;
  mapSubscription: Subscription | undefined;

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
    this.deploymentForm.setAsyncValidators([noOverlapValidator.validate.bind(noOverlapValidator)])
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
          this.title = 'Edit Deployment';
          this.mode = 'edit';

          this.dataService.listNodes().subscribe(nodes => {
            this.nodes = nodes;
            controls.node_id.setValue(deployment.node.node_id);
          });

          controls.deployment_id.setValue(deployment.deployment_id);
          if (deployment.period.start !== null) controls.period_start.setValue(moment.utc(deployment.period.start).local());
          if (deployment.period.end !== null) controls.period_end.setValue(moment.utc(deployment.period.end).local());

          this.displayCoordinates = deployment.location;

          controls.lat.setValue(deployment.location.lat);
          controls.lon.setValue(deployment.location.lon);

          controls.description.setValue(deployment.description);

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
            this.deploymentForm.controls.node_id.setValue(node.node_id);
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
    ).subscribe(coordinates => {
      this.deploymentForm.controls.lat.setValue(coordinates.lat);
      this.deploymentForm.controls.lon.setValue(coordinates.lon);
    });
  }

  editCoordinates(event: Event) {
    if ((event.target as HTMLInputElement).name === 'lat') {
      this.coordinates = {lat: Number((event.target as HTMLInputElement).value), lon: this.deploymentForm.controls.lon.value};
      this.deploymentForm.controls.lat.setValue(this.coordinates.lat);
    }
    if ((event.target as HTMLInputElement).name === 'lon') {
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
    const v = this.deploymentForm.value;
    const deployment = {
      node_id: v.node_id,
      deployment_id: v.deployment_id,
      period: {
        start: v.period_start,
        end:   v.period_end
      },
      description: v.description,
      location: {
        lat: v.lat,
        lon: v.lon
      }
    };
    this.dataService.putDeployment(deployment).subscribe(r => {
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
          this.dataService.deleteDeployment(deployment_id).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 409) {
                this.dialog.open(this.deleteErrorDialog, {
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
