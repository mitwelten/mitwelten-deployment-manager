import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Deployment } from 'src/app/shared';
import { MapComponent } from '../../map.component';

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

  constructor (
    public dialogRef: MatDialogRef<DeploymentComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) deployment: Deployment,
    ) {
    this.deployment = deployment;
  }

  edit(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/deployments/edit/', this.deployment.deployment_id]);
    });
    this.dialogRef.close();
  }
}
