import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { DataService, Environment, EnvironmentLabel } from 'src/app/shared';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { EnvFormComponent } from '../env-form/env-form.component';
import { EnvironmentsDataSource } from './env-datasource';

@Component({
  selector: 'app-env-list',
  templateUrl: './env-list.component.html',
  styleUrls: ['./env-list.component.css']
})
export class EnvListComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Environment>;
  @ViewChild('deleteError') deleteErrorDialog: TemplateRef<any>;
  dataSource: EnvironmentsDataSource;
  deletePending = false;
  labels: {[key: string]: EnvironmentLabel};

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  filterForm = new FormGroup({
    name:      new FormControl<[string]|null>(null),
  });

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
    private breakpointObserver: BreakpointObserver,
    private snackBar: MatSnackBar,
  ) {
    this.dataSource = new EnvironmentsDataSource(this.dataService);
    this.dataService.getEnvLabels().subscribe(labels => this.labels = labels);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filter = this.filterForm;
    this.table.dataSource = this.dataSource;
  }

  editEnvironment(env: Environment) {
    const dialogRef = this.dialog.open(EnvFormComponent, { data: {env, labels: this.labels} });
    dialogRef.afterClosed().subscribe(response => {
      if (response === true) this.dataSource.fetchEnvironments()
    });
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

}
