import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { DeploymentsDataSource } from './deployments-datasource';
import { DataService, Deployment } from 'src/app/shared';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';

import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

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
export class DeploymentListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Deployment>;
  dataSource: DeploymentsDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['action', 'node_label', 'type', 'platform', 'location', 'period_from', 'period_to']; // , 'type', 'platform', 'description'

  constructor(private dataService: DataService, private router: Router) {
    this.dataSource = new DeploymentsDataSource(dataService);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

}