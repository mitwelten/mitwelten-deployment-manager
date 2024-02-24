import { Routes } from '@angular/router';
import { AuthenticationGuard } from './auth/authentication.guard';

export const routes: Routes = [
  { path: 'node/:label', redirectTo: 'nodes/:label', pathMatch: 'full' },
  { path: 'nodes', loadChildren: () => import('./components/nodes/node.routes').then(m => m.nodeRoutes), canActivate: [AuthenticationGuard] },
  { path: 'deployment/:id', redirectTo: 'deployments/:id', pathMatch: 'full' },
  { path: 'deployments', loadChildren: () => import('./components/deployments/deployment.routes').then(m => m.deploymentRoutes), canActivate: [AuthenticationGuard] },
  { path: 'tags', loadComponent: () => import('./components/tags/tag-list/tag-list.component').then(m => m.TagListComponent), /* component: TagListComponent, */ canActivate: [AuthenticationGuard] },
  { path: 'environments', loadComponent: () => import('./components/environments/environment-list/environment-list.component').then(m => m.EnvironmentListComponent), canActivate: [AuthenticationGuard] },
  { path: '', redirectTo: 'deployments', pathMatch: 'full' }, // component: DeploymentListComponent, canActivate: [AuthenticationGuard] },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];
