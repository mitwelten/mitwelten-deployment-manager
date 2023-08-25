import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
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
import { FormGroup } from '@angular/forms';
import { FilterStoreService } from 'src/app/shared/filter-store.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DeploymentFilterComponent } from './deployment-filter.component';
import { Router } from '@angular/router';

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

  filterForm: FormGroup;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['action', 'node_label', 'type', 'platform', 'description', 'period_start', 'period_end'];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private dataService: DataService,
    public filterStore: FilterStoreService,
    private bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
  ) {
    this.dataSource = new DeploymentsDataSource(this.dataService);
    this.filterForm = this.filterStore.deploymentsFilter;
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

  filter() {
    this.bottomSheet.open(DeploymentFilterComponent, { data: { dataSource: this.dataSource }})
  }

  @HostListener('window:keydown.f', ['$event'])
  filterKey(event: KeyboardEvent) {
    if (!this.bottomSheet._openedBottomSheetRef) {
      event.preventDefault();
      this.filter();
    }
  }

  @HostListener('window:keydown.a', ['$event'])
  addKey(event: KeyboardEvent) {
    event.preventDefault();
    this.router.navigate(['/deployments/add']);
  }

  @HostListener('window:keydown.c', ['$event'])
  clearKey(event: KeyboardEvent) {
    // only reset if no form an therefore no input is open
    if (!this.bottomSheet._openedBottomSheetRef) {
      event.preventDefault();
      this.filterForm.reset();
    }
  }

}
