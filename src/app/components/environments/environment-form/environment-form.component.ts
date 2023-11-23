import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { DataService, LocationService } from 'src/app/services';
import { CoordinatePoint, Environment, EnvironmentLabel } from 'src/app/shared';
import { MapComponent } from '../../map.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-environment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSliderModule,
    MapComponent,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './environment-form.component.html',
  styleUrl: './environment-form.component.css'
})
export class EnvironmentFormComponent implements OnInit {
  coordinates: CoordinatePoint = { lon: 7.614704694445322, lat: 47.53603016174955 };

  envForm =          new FormGroup({
    environment_id:  new FormControl<number|undefined>(undefined, {nonNullable: true}),
    timestamp:       new FormControl<string|undefined>(undefined, {nonNullable: true, validators: [Validators.required]}),
    location:        new FormGroup({
      lat:           new FormControl<number|undefined>(undefined, {nonNullable: true, validators: [Validators.required]}),
      lon:           new FormControl<number|undefined>(undefined, {nonNullable: true, validators: [Validators.required]}),
    }),
    attribute_01:    new FormControl<number|undefined>(undefined, {nonNullable: true}),
    attribute_02:    new FormControl<number|undefined>(undefined, {nonNullable: true}),
    attribute_03:    new FormControl<number|undefined>(undefined, {nonNullable: true}),
    attribute_04:    new FormControl<number|undefined>(undefined, {nonNullable: true}),
    attribute_05:    new FormControl<number|undefined>(undefined, {nonNullable: true}),
    attribute_06:    new FormControl<number|undefined>(undefined, {nonNullable: true}),
    attribute_07:    new FormControl<number|undefined>(undefined, {nonNullable: true}),
    attribute_08:    new FormControl<number|undefined>(undefined, {nonNullable: true}),
    attribute_09:    new FormControl<number|undefined>(undefined, {nonNullable: true}),
    attribute_10:    new FormControl<number|undefined>(undefined, {nonNullable: true}),
  });

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(
    public dialogRef: MatDialogRef<EnvironmentFormComponent>,
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
    if ((event.target as HTMLInputElement).name === 'lat' && this.envForm.controls.location.controls.lon.value) {
      this.coordinates = {lat: Number((event.target as HTMLInputElement).value), lon: this.envForm.controls.location.controls.lon.value};
    }
    if ((event.target as HTMLInputElement).name === 'lon' && this.envForm.controls.location.controls.lat.value) {
      this.coordinates = {lat: this.envForm.controls.location.controls.lat.value, lon: Number((event.target as HTMLInputElement).value)};
    }
  }
}
