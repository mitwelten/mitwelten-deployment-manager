import { AfterViewInit, ChangeDetectorRef, Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { DataService, Environment, EnvironmentLabel } from 'src/app/shared';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { EnvFormComponent } from '../env-form/env-form.component';
import { EnvironmentsDataSource } from './env-datasource';
import { EnvFilterComponent } from '../env-filter/env-filter.component';
import { FilterStoreService } from 'src/app/shared/filter-store.service';
import { Feature, FeatureCollection } from 'geojson';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-env-list',
  templateUrl: './env-list.component.html',
  styleUrls: ['./env-list.component.css']
})
export class EnvListComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Environment>;
  @ViewChild(MapComponent) map?: MapComponent;
  @ViewChild('toggleDisplay') toggleDisplay!: MatButtonToggleGroup;
  @ViewChild('deleteError') deleteErrorDialog: TemplateRef<any>;
  dataSource: EnvironmentsDataSource;
  deletePending = false;
  display = 'table';
  labels: {[key: string]: EnvironmentLabel};

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
    this.dataSource = new EnvironmentsDataSource(this.dataService);
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
    this.dataSource.filter = this.filterStore.envFilter;
    this.table.dataSource = this.dataSource;
  }

  private initMap() {
    this.dataSource.filter = this.filterStore.envFilter;
    this.dataSource.paginator = null;
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
    this.dialog.open(EnvFilterComponent, { data: this.labels } );
  }

  editEnvironment(payload: Environment | number) {
    const edit = (env: Environment) => {
      const dialogRef = this.dialog.open(EnvFormComponent, { data: {env, labels: this.labels} });
      dialogRef.afterClosed().subscribe(response => {
        if (response === true) this.dataSource.fetchEnvironments()
      });
    }
    if (typeof payload === 'number') this.dataService.getEnvEntry(payload).subscribe(env => edit(env));
    else edit(payload);
  }

  addEnvironment() {
    const dialogRef = this.dialog.open(EnvFormComponent, { data: {env: null, labels: this.labels} });
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
          this.dataService.deleteEnvEntry(env.environment_id).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 409) {
                this.dialog.open(this.deleteErrorDialog, {
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
