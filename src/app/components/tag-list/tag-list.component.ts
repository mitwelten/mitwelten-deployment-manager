import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { DataService, Tag } from 'src/app/shared';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { TagFormComponent } from '../tag-form/tag-form.component';
import { TagsDataSource } from './tags-datasource';
import { FilterStoreService } from 'src/app/shared/filter-store.service';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.css']
})
export class TagListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Tag>;
  @ViewChild(MatInput, { static: true }) tagFilterInput?: MatInput;
  @ViewChild('deleteError') deleteErrorDialog: TemplateRef<any>;
  dataSource: TagsDataSource;
  deletePending = false;

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['action', 'name', 'deployments', 'notes', 'created', 'updated'];

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
    this.dataSource = new TagsDataSource(this.dataService);
  }

  ngOnInit(): void {
    this.tagFilterInput.focus();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filter = this.filterStore.tagsFilter;
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
          this.dataService.deleteTag(tag.tag_id).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 409) {
                this.dialog.open(this.deleteErrorDialog, {
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
