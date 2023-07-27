import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CoordinatePoint, DataService, Environment, EnvironmentLabel, LocationService } from 'src/app/shared';

@Component({
  selector: 'app-env-form',
  templateUrl: './env-form.component.html',
  styleUrls: ['./env-form.component.css']
})
export class EnvFormComponent implements OnInit {
  coordinates: CoordinatePoint = { lon: 7.614704694445322, lat: 47.53603016174955 };

  envForm =          new FormGroup({
    environment_id:  new FormControl<number|null>(null),
    timestamp:       new FormControl<string|null>(null, Validators.required),
    location:        new FormGroup({
      lat:           new FormControl<number|null>(null, Validators.required),
      lon:           new FormControl<number|null>(null, Validators.required),
    }),
    attribute_01:    new FormControl<number|null>(null),
    attribute_02:    new FormControl<number|null>(null),
    attribute_03:    new FormControl<number|null>(null),
    attribute_04:    new FormControl<number|null>(null),
    attribute_05:    new FormControl<number|null>(null),
    attribute_06:    new FormControl<number|null>(null),
    attribute_07:    new FormControl<number|null>(null),
    attribute_08:    new FormControl<number|null>(null),
    attribute_09:    new FormControl<number|null>(null),
    attribute_10:    new FormControl<number|null>(null),
  });

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(
    public dialogRef: MatDialogRef<EnvFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {env: Environment, labels: {[key: string]: EnvironmentLabel}},
    private dataService: DataService,
    private snackBar: MatSnackBar,
    private locationService: LocationService,
  ) {}

  ngOnInit(): void {
    if (this.data.env !== null) {
      this.coordinates = <CoordinatePoint> this.data.env.location;
      this.envForm.patchValue(this.data.env);
    } else {
      this.envForm.controls.timestamp.setValue(new Date().toISOString());
      this.envForm.controls.timestamp.updateValueAndValidity();
    }
  }

  getErrorMessage() {
    if (this.envForm.controls.timestamp.hasError('required')) {
      return 'You must enter a value';
    }
    else {
      return 'Validation error'
    }
  }

  submit() {
    if (this.envForm.controls.environment_id.value === null) {
      this.dataService.postEnvEntry(this.envForm.value).subscribe(env => {
        this.snackBar.open(`Environment entry ${env.environment_id} added`, '🎉', this.snackBarConfig);
        this.dialogRef.close(true);
      });
    } else {
      this.dataService.putEnvEntry(this.envForm.value).subscribe(env => {
        this.snackBar.open(`Environment entry ${env.environment_id} updated`, '🎉', this.snackBarConfig);
        this.dialogRef.close(true);
      });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }

  getLocation() {
    this.locationService.getLocation().subscribe(location => {
      if (location === false) {
        this.snackBar.open('Finding your location failed.', '😔', this.snackBarConfig)
      } else {
        this.coordinates = location;
        this.envForm.controls.location.setValue(location);
      }
    });
  }

  /**
   * Update coordinates for input to map component
   */
  editCoordinates(event: Event) {
    if ((event.target as HTMLInputElement).name === 'lat') {
      this.coordinates = {lat: Number((event.target as HTMLInputElement).value), lon: this.envForm.controls.location.controls.lon.value};
    }
    if ((event.target as HTMLInputElement).name === 'lon') {
      this.coordinates = {lat: this.envForm.controls.location.controls.lat.value, lon: Number((event.target as HTMLInputElement).value)};
    }
  }
}
