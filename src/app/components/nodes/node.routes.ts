import { Routes } from "@angular/router";
import { NodeFormComponent } from "./node-form/node-form.component";
import { NodeListComponent } from "./node-list/node-list.component";

export const nodeRoutes: Routes = [
  { path: 'edit/:id', component: NodeFormComponent, runGuardsAndResolvers: 'always' },
  { path: 'add', component: NodeFormComponent },
  { path: ':label', component: NodeListComponent },
  { path: '', component: NodeListComponent }
];
