import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Environment, EnvironmentLabel, DataService } from 'src/app/shared';
import { FilterStoreService } from 'src/app/shared/filter-store.service';

@Component({
  selector: 'app-env-filter',
  templateUrl: './env-filter.component.html',
  styleUrls: ['./env-filter.component.css']
})
export class EnvFilterComponent {

  constructor(
    public dialogRef: MatDialogRef<EnvFilterComponent>,
    @Inject(MAT_DIALOG_DATA) public labels: {[key: string]: EnvironmentLabel},
    public filterStore: FilterStoreService,
    private dataService: DataService
  ) { }

}
