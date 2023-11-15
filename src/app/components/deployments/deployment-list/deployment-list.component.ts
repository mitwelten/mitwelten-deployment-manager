import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, map, shareReplay } from 'rxjs';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';

import { DataService, FilterStoreService } from 'src/app/services';
import { Deployment } from 'src/app/shared';
import { DeploymentFilterComponent } from '../deployment-filter.component';
import { DeploymentComponent } from '../deployment/deployment.component';
import { DeploymentsDataSource } from '../deployments-datasource';

@Component({
  selector: 'app-deployment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatDialogModule,
    MatBottomSheetModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    MatBadgeModule,
  ],
  templateUrl: './deployment-list.component.html',
  styleUrl: './deployment-list.component.css'
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
    this.filterForm = this.filterStore.deploymentsFilter;
    this.dataSource = new DeploymentsDataSource(this.dataService, this.filterForm);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
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
