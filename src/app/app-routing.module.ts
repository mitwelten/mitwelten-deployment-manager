import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeploymentFormComponent } from './components/deployment-form/deployment-form.component';
import { DeploymentListComponent } from './components/deployment-list/deployment-list.component';
import { NodeFormComponent } from './components/node-form/node-form.component';
import { NodeListComponent } from './components/node-list/node-list.component';

const routes: Routes = [
  { path: "nodes/edit/:id", component: NodeFormComponent, runGuardsAndResolvers: 'always' },
  { path: "nodes/add", component: NodeFormComponent },
  { path: "nodes", component: NodeListComponent },
  { path: "deployments/edit/:id", component: DeploymentFormComponent  },
  { path: "deployments/add/:node", component: DeploymentFormComponent },
  { path: "deployments/add", component: DeploymentFormComponent },
  { path: "deployments/:id", component: DeploymentListComponent },
  { path: "deployments", component: DeploymentListComponent },
  { path: "", component: NodeFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
