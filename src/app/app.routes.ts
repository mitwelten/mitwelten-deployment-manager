import { Routes } from '@angular/router';
import { AuthenticationGuard } from './auth/authentication.guard';
import { DeploymentFormComponent } from './components/deployments/deployment-form/deployment-form.component';
import { DeploymentListComponent } from './components/deployments/deployment-list/deployment-list.component';
import { EnvironmentListComponent } from './components/environments/environment-list/environment-list.component';
import { NodeFormComponent } from './components/nodes/node-form/node-form.component';
import { NodeListComponent } from './components/nodes/node-list/node-list.component';

export const routes: Routes = [
  { path: 'nodes/edit/:id', component: NodeFormComponent, runGuardsAndResolvers: 'always', canActivate: [AuthenticationGuard] },
  { path: 'nodes/add', component: NodeFormComponent, canActivate: [AuthenticationGuard] },
  { path: 'nodes', component: NodeListComponent },
  { path: 'node/:label', component: NodeListComponent },
  { path: 'deployments/edit/:id', component: DeploymentFormComponent, canActivate: [AuthenticationGuard] },
  { path: 'deployments/add/:node', component: DeploymentFormComponent, canActivate: [AuthenticationGuard] },
  { path: 'deployments/add', component: DeploymentFormComponent, canActivate: [AuthenticationGuard] },
  { path: 'deployments/:id', component: DeploymentListComponent },
  { path: 'deployments', component: DeploymentListComponent },
  { path: 'tags', loadComponent: () => import('./components/tags/tag-list/tag-list.component').then(m => m.TagListComponent), /* component: TagListComponent, */ canActivate: [AuthenticationGuard] },
  { path: 'environments', component: EnvironmentListComponent },
  { path: '', component: DeploymentListComponent, canActivate: [AuthenticationGuard] },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];
