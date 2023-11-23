import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';

import { DataService, FilterStoreService } from 'src/app/services';
import { Tag } from 'src/app/shared';
import { DeleteConfirmDialogComponent } from '../../delete-confirm-dialog.component';
import { TagFormComponent } from '../tag-form/tag-form.component';
import { TagsDataSource } from '../tags-datasource';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.css'
})
export class TagListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Tag>;
  @ViewChild(MatInput, { static: true }) tagFilterInput?: MatInput;
  @ViewChild('deleteError') deleteErrorDialog?: TemplateRef<never>;
  dataSource: TagsDataSource;
  deletePending = false;

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['action', 'id', 'name', 'deployments', 'notes', 'created', 'updated'];

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
    public filterStore: FilterStoreService,
  ) {
    this.dataSource = new TagsDataSource(this.dataService, this.filterStore.tagsFilter);
  }

  ngOnInit(): void {
    this.tagFilterInput?.focus();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  editTag(tag: Tag) {
    const dialogRef = this.dialog.open(TagFormComponent, { data: tag });
    dialogRef.afterClosed().subscribe(response => {
      if (response === true) this.dataSource.fetchTags()
    });
  }

  deleteTag(tag: Tag) {
    if(tag.tag_id) {
      const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: {
          recordType: 'Tag',
          recordLabel: `"${tag.name}" (ID: ${tag.tag_id})`
        }
      });

      dialogRef.afterClosed().subscribe(response => {
        if (response === true) {
          this.deletePending = true;
          if (tag.tag_id) this.dataService.deleteTag(tag.tag_id).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 409) {
                this.dialog.open(this.deleteErrorDialog!, {
                  data: { name: tag.name, tag_id: tag.tag_id }
                });
              }
              return of(false);
          })).subscribe(response => {
            this.deletePending = false;
            if (response === true) {
              this.snackBar.open('Tag deleted', '😬', this.snackBarConfig);
              this.dataSource.fetchTags();
            } else {
              this.snackBar.open('Tag NOT deleted', '🙈', this.snackBarConfig);
            }
          });
        }
      });
    }
  }

}
