import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Deployment } from 'src/app/shared';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.component.html',
  styleUrls: ['./deployment.component.css']
})
export class DeploymentComponent implements OnInit {

  deployment: Deployment;

  constructor(@Inject(MAT_DIALOG_DATA) deployment: Deployment) {
    this.deployment = deployment;
  }

  ngOnInit(): void {
  }

  edit(): void {
  }

}
