import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';

import { Feature, FeatureCollection } from 'geojson';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataService, FilterStoreService } from 'src/app/services';
import { Environment, EnvironmentLabel } from 'src/app/shared';
import { DeleteConfirmDialogComponent } from '../../delete-confirm-dialog.component';
import { MapComponent } from '../../map.component';
import { EnvironmentDataSource } from '../environment-datasource';
import { EnvironmentFilterComponent } from '../environment-filter/environment-filter.component';
import { EnvironmentFormComponent } from '../environment-form/environment-form.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-environment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonToggleModule,
    MapComponent,
    MatPaginatorModule,
    MatDialogClose,
    MatTableModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './environment-list.component.html',
  styleUrl: './environment-list.component.css'
})
export class EnvironmentListComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Environment>;
  @ViewChild(MapComponent) map?: MapComponent;
  @ViewChild('toggleDisplay') toggleDisplay!: MatButtonToggleGroup;
  @ViewChild('deleteError') deleteErrorDialog?: TemplateRef<never>;
  dataSource: EnvironmentDataSource;
  deletePending = false;
  display = 'table';
  labels?: {[key: string]: EnvironmentLabel};

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['action', 'environment_id', 'timestamp', 'attribute_01', 'attribute_02', 'attribute_03', 'attribute_04', 'attribute_05', 'attribute_06', 'attribute_07', 'attribute_08', 'attribute_09', 'attribute_10', 'created', 'updated'];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
    public filterStore: FilterStoreService,
    private breakpointObserver: BreakpointObserver,
    private snackBar: MatSnackBar,
    private changeDetector : ChangeDetectorRef,
  ) {
    this.dataSource = new EnvironmentDataSource(this.dataService, this.filterStore.envFilter);
    this.dataService.getEnvLabels().subscribe(labels => this.labels = labels);
  }

  ngAfterViewInit(): void {
    this.toggleDisplay.change.subscribe(selection => {
      this.display = selection.value;
      this.changeDetector.detectChanges();
      if (selection.value === 'table') this.initTable();
      if (selection.value === 'map') this.initMap();
    })
    if (this.display === 'table') this.initTable();
    if (this.display === 'map') this.initMap();
  }

  private initTable() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  private initMap() {
    this.dataSource.paginator = undefined;
    this.dataSource.connect().pipe(map(envs => {
      const features = envs.map(e => {
        return <Feature>{
          type: 'Feature',
          properties: e,
          geometry: { type: 'Point', coordinates: [e.location.lon, e.location.lat] }
        }
      });
      return <FeatureCollection>{
        type: 'FeatureCollection',
        features: features
      }
    })).subscribe(geojson => {
      if (this.map) this.map.features = geojson;
    })
  }

  filter() {
    this.dialog.open(EnvironmentFilterComponent, { data: this.labels } );
  }

  editEnvironment(payload: Environment | number) {
    const edit = (env: Environment) => {
      const dialogRef = this.dialog.open(EnvironmentFormComponent, { data: {env, labels: this.labels} });
      dialogRef.afterClosed().subscribe(response => {
        if (response === true) this.dataSource.fetchEnvironments()
      });
    }
    if (typeof payload === 'number') this.dataService.getEnvEntry(payload).subscribe(env => edit(env));
    else edit(payload);
  }

  addEnvironment() {
    const dialogRef = this.dialog.open(EnvironmentFormComponent, { data: {env: null, labels: this.labels} });
    dialogRef.afterClosed().subscribe(response => {
      if (response === true) this.dataSource.fetchEnvironments()
    });
  }

  deleteEnvironment(env: Environment) {
    if(env.environment_id) {
      const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: {
          recordType: 'Environment Entry',
          recordLabel: `"ID: ${env.environment_id}"`
        },
        maxWidth: '80vw',
        minWidth: '80vw'
      });

      dialogRef.afterClosed().subscribe(response => {
        if (response === true) {
          this.deletePending = true;
          if (env.environment_id) this.dataService.deleteEnvEntry(env.environment_id).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 409) {
                this.dialog.open(this.deleteErrorDialog!, {
                  data: { environment_id: env.environment_id }
                });
              }
              return of({ status: 'error', id: env.environment_id });
          })).subscribe(response => {
            this.deletePending = false;
            if (response.status !== 'error') {
              this.snackBar.open(`Environment entry ${response.id} deleted`, '😬', this.snackBarConfig);
              this.dataSource.fetchEnvironments();
            } else {
              this.snackBar.open(`Environment entry ${response.id} NOT deleted`, '🙈', this.snackBarConfig);
            }
          });
        }
      });
    }
  }

  @HostListener('window:keydown.f', ['$event'])
  filterKey(event: KeyboardEvent) {
    if (!this.dialog.openDialogs.length) {
      event.preventDefault();
      this.filter();
    }
  }

  @HostListener('window:keydown.a', ['$event'])
  addKey(event: KeyboardEvent) {
    if (!this.dialog.openDialogs.length) {
      event.preventDefault();
      this.addEnvironment();
    }
  }

  @HostListener('window:keydown.c', ['$event'])
  clearKey(event: KeyboardEvent) {
    // only reset if no form an therefore no input is open
    if (!this.dialog.openDialogs.length) {
      event.preventDefault();
      this.filterStore.envFilter.reset();
    }
  }

}
