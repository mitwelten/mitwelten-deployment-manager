import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeploymentFormComponent } from './components/deployment-form/deployment-form.component';
import { DeploymentListComponent } from './components/deployment-list/deployment-list.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { NodeFormComponent } from './components/node-form/node-form.component';
import { NodeListComponent } from './components/node-list/node-list.component';
import { AuthenticationGuard } from './shared/authentication.guard';

const routes: Routes = [
  { path: 'nodes/edit/:id', component: NodeFormComponent, runGuardsAndResolvers: 'always', canActivate: [AuthenticationGuard] },
  { path: 'nodes/add', component: NodeFormComponent, canActivate: [AuthenticationGuard] },
  { path: 'nodes', component: NodeListComponent },
  { path: 'deployments/edit/:id', component: DeploymentFormComponent, canActivate: [AuthenticationGuard] },
  { path: 'deployments/add/:node', component: DeploymentFormComponent, canActivate: [AuthenticationGuard] },
  { path: 'deployments/add', component: DeploymentFormComponent, canActivate: [AuthenticationGuard] },
  { path: 'deployments/:id', component: DeploymentListComponent },
  { path: 'deployments', component: DeploymentListComponent },
  { path: 'login', component: LoginFormComponent },
  { path: '', component: DeploymentListComponent, canActivate: [AuthenticationGuard] },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
