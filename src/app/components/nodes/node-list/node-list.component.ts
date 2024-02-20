import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, map, shareReplay } from 'rxjs';

import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';

import { DataService, FilterStoreService } from 'src/app/services';
import { Node, isNode } from 'src/app/shared';
import { NodeFilterComponent } from '../node-filter.component';
import { NodeComponent } from '../node/node.component';
import { NodesDataSource } from '../nodes-datasource';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-node-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatBadgeModule,
    MatPaginatorModule,
    MatSortModule,
    MatBottomSheetModule,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './node-list.component.html',
  styleUrl: './node-list.component.css'
})
export class NodeListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Node>;

  dataSource: NodesDataSource;
  nodeForm: FormGroup;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['action', 'node_label', 'type', 'platform', 'description'];

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private dataService: DataService,
    public filterStore: FilterStoreService,
    private bottomSheet: MatBottomSheet,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.nodeForm = this.filterStore.nodesFilter;
    this.dataSource = new NodesDataSource(dataService, this.nodeForm);
  }

  ngOnInit(): void {
    // load node record into dialog when label supplied as deep-link
    if('label' in this.route.snapshot.params) {
      this.dataService.getNodeByLabel(this.route.snapshot.params['label'])
        .subscribe(node => {
          if (isNode(node)) this.detail(node);
          else {
            this.snackBar.open('No node found with this label!', '😵', this.snackBarConfig);
            this.router.navigate(['/nodes']);
          }
        });
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  detail(node: Node) {
    this.dialog.open(NodeComponent, {
      data: node
    });
  }

  filter() {
    this.bottomSheet.open(NodeFilterComponent, { data: { dataSource: this.dataSource }})
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
    if (!this.bottomSheet._openedBottomSheetRef) {
      event.preventDefault();
      this.router.navigate(['/nodes/add']);
    }
  }

  @HostListener('window:keydown.c', ['$event'])
  clearKey(event: KeyboardEvent) {
    // only reset if no form an therefore no input is open
    if (!this.bottomSheet._openedBottomSheetRef) {
      event.preventDefault();
      this.nodeForm.reset();
    }
  }

}
