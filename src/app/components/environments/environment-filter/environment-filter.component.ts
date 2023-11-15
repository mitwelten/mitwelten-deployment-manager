import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { FilterStoreService } from 'src/app/services';
import { EnvironmentLabel } from 'src/app/shared';

@Component({
  selector: 'app-environment-filter',
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
    MatDialogModule,
  ],
  templateUrl: './environment-filter.component.html',
  styleUrl: './environment-filter.component.css'
})
export class EnvironmentFilterComponent {

  constructor(
    public dialogRef: MatDialogRef<EnvironmentFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public labels: {[key: string]: EnvironmentLabel},
    public filterStore: FilterStoreService
  ) { }

}
