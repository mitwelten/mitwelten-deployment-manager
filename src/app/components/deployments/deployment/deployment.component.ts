import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Deployment } from 'src/app/shared';
import { MapComponent } from '../../map.component';
import { FilterStoreService } from 'src/app/services';

@Component({
  selector: 'app-deployment',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatChipsModule,
    MatButtonModule,
    MapComponent,
  ],
  templateUrl: './deployment.component.html',
  styleUrl: './deployment.component.css'
})
export class DeploymentComponent {

  deployment: Deployment;
  filter: FormGroup

  constructor (
    public dialogRef: MatDialogRef<DeploymentComponent>,
    public filterService: FilterStoreService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) deployment: Deployment,
    ) {
    this.deployment = deployment;
    this.filter = filterService.deploymentsFilter;
  }

  edit(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/deployments/edit/', this.deployment.deployment_id]);
    });
    this.dialogRef.close();
  }

  checkTagSelected(tag_id?: number): boolean {
    return !!this.filterService.deploymentsFilter.controls.tags.value?.
      filter(t => t === tag_id).length;
  }

  selectionChange(e: MatChipSelectionChange) {
    if (e.isUserInput) {
      const control = this.filterService.deploymentsFilter.controls.tags;
      const tags = control.value ?? [];
      if (e.selected) control.setValue([...tags, <number>e.source.value]);
      else control.setValue(tags.filter(t => t !== e.source.value));
    }
  }

}
