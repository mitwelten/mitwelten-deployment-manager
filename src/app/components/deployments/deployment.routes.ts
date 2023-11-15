import { Routes } from "@angular/router";
import { DeploymentFormComponent } from "./deployment-form/deployment-form.component";
import { DeploymentListComponent } from "./deployment-list/deployment-list.component";

export const deploymentRoutes: Routes = [
  { path: 'edit/:id', component: DeploymentFormComponent },
  { path: 'add/:node', component: DeploymentFormComponent },
  { path: 'add', component: DeploymentFormComponent },
  { path: ':id', component: DeploymentListComponent },
  { path: '', component: DeploymentListComponent },
];
