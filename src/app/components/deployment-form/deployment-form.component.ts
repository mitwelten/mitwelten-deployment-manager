import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { ActivatedRoute } from '@angular/router';
import { DataService, Node } from 'src/app/shared';
import { CoordinatePoint } from 'src/app/shared/coordinate-point.type';
import { MapComponent } from '../map/map.component';
import { Validators } from '@angular/forms';
import { NoOverlapValidator } from 'src/app/shared/overlap-validator.service';
import { Subscription, throttleTime } from 'rxjs';

@Component({
  selector: 'app-deployment-form',
  templateUrl: './deployment-form.component.html',
  styleUrls: ['./deployment-form.component.css']
})
export class DeploymentFormComponent implements OnInit, AfterViewInit, OnDestroy {

  title = 'Add Deployment';
  coordinates: CoordinatePoint = { lon: 7.614704694445322, lat: 47.53603016174955 };

  nodes: Node[] | [] = [];

  deploymentForm = new FormGroup({
    deployment_id: new FormControl<number|null>(null, Validators.required),
    node_id:       new FormControl<number|null>(null, Validators.required),
    period_start:  new FormControl<string|null>(null),
    period_end:    new FormControl<string|null>(null),
    lat:           new FormControl<number|null>(null, Validators.required),
    lon:           new FormControl<number|null>(null, Validators.required),
  });

  displayCoordinates: CoordinatePoint | undefined;

  @ViewChild(MatDatepicker) rangePicker: MatDatepicker<Date> | undefined;
  @ViewChild(MapComponent) map: MapComponent | undefined;
  mapSubscription: Subscription | undefined;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private noOverlapValidator: NoOverlapValidator
  ) {
    this.deploymentForm.setAsyncValidators([noOverlapValidator.validate.bind(noOverlapValidator)])
  }

  ngOnInit(): void {

    if ('id' in this.route.snapshot.params) {
      this.title = 'Edit Deployment';
      const id = Number(this.route.snapshot.params['id']);

      this.dataService.getDeploymentById(id).subscribe(deployment => {
        // TODO: only if deployment id != null. check nodes form
        this.deploymentForm.controls.deployment_id.setValue(deployment.deployment_id ?? null);
        this.deploymentForm.controls.node_id.setValue(deployment.node.node_id ?? null);
        this.deploymentForm.controls.period_start.setValue(deployment.period.start ?? null);
        this.deploymentForm.controls.period_end.setValue(deployment.period.end ?? null);
        this.displayCoordinates = deployment.location.location;
        this.deploymentForm.controls.lat.setValue(deployment.location.location.lat);
        this.deploymentForm.controls.lon.setValue(deployment.location.location.lon);
        if (this.map !== undefined) {
          this.coordinates = deployment.location.location
        }
      });
    } else {
      this.title = 'Add Deployment';
      this.deploymentForm.controls.deployment_id.clearValidators();
      this.deploymentForm.controls.lat.setValue(this.coordinates.lat);
      this.deploymentForm.controls.lon.setValue(this.coordinates.lon);
    }

    if ('node' in this.route.snapshot.params) {
      this.dataService.getNodeById(Number(this.route.snapshot.params['node']))
        .subscribe(node => {
          if (node === null) {
            this.dataService.listNodes().subscribe(nodes => this.nodes = nodes);
          } else {
            this.nodes = [node];
            this.deploymentForm.controls.node_id.setValue(node.node_id ?? null);
            this.deploymentForm.markAsTouched();
          }
        });
    } else {
      this.dataService.listNodes().subscribe(nodes => this.nodes = nodes);
    }
  }

  ngAfterViewInit(): void {
    this.mapSubscription = this.map?.coordinatesSet.asObservable().pipe(
      throttleTime(500)
    ).subscribe(coordinates => {
      this.deploymentForm.controls.lat.setValue(coordinates.lat);
      this.deploymentForm.controls.lon.setValue(coordinates.lon);
    });
  }

  ngOnDestroy(): void {
    this.mapSubscription?.unsubscribe();
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
      location: {
        lat: v.lat,
        lon: v.lon
      }
    };
    this.dataService.putDeployment(deployment).subscribe(r => {
      this.deploymentForm.reset();
      console.log('done');
    });
  }

  mode = 'edit'
  delete() {

  }
}
