import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';
import { DataService, Node, isNode } from 'src/app/shared';
import { NodeComponent } from '../node/node.component';
import { NodesDataSource } from './list-datasource';
import { FilterStoreService } from 'src/app/shared/filter-store.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NodeFilterComponent } from './node-filter.component';

@Component({
  selector: 'app-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.css']
})
export class NodeListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Node>;
  dataSource: NodesDataSource;

  nodeForm: FormGroup;
  typeOptions: any;
  platformOptions: any;

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
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.dataSource = new NodesDataSource(dataService);
    this.nodeForm = this.filterStore.nodesFilter;
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
          };
        });
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filter = this.nodeForm;
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
    event.preventDefault();
    this.router.navigate(['/nodes/add']);
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
