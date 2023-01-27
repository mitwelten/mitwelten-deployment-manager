import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { Deployment } from 'src/app/shared';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.component.html',
  styleUrls: ['./deployment.component.css']
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
