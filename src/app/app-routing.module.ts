import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeploymentListComponent } from './components/deployment-list/deployment-list.component';
import { EditFormComponent } from './components/edit-form/edit-form.component';
import { ListComponent } from './components/list/list.component';

const routes: Routes = [
  { path: "nodes/edit", component: EditFormComponent },
  { path: "nodes", component: ListComponent },
  { path: "deployments/edit/:id", component: DeploymentListComponent },
  { path: "deployments/:id", component: DeploymentListComponent },
  { path: "deployments", component: DeploymentListComponent },
  { path: "", component: EditFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
