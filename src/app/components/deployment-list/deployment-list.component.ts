import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { DataService, Deployment } from 'src/app/shared';
import { DeploymentsDataSource } from './deployments-datasource';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { DeploymentComponent } from '../deployment/deployment.component';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-list',
  templateUrl: './deployment-list.component.html',
  styleUrls: ['./deployment-list.component.css'],
  animations: [
    trigger('overOut', [
      state('over', style({backgroundColor: 'yellow'})),
      state('out', style({backgroundColor: 'transparent'})),
      transition('out => over', [animate(100)]),
      transition('over => out', [animate(100)])
    ])
  ]
})
export class DeploymentListComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Deployment>;
  dataSource: DeploymentsDataSource;

  filterForm = new FormGroup({
    node:      new FormControl<[number]|null>(null),
    tags:      new FormControl<[number]|null>(null),
    type:      new FormControl<[string]|null>(null),
    platform:  new FormControl<[string]|null>(null),
  });

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['action', 'node_label', 'type', 'platform', 'description', 'period_start', 'period_end'];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.dataSource = new DeploymentsDataSource(this.dataService);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filter = this.filterForm;
    this.table.dataSource = this.dataSource;
  }

  detail(deployment: Deployment) {
    this.dialog.open(DeploymentComponent, {
      data: deployment
    });
  }

}
