import { DataSource } from '@angular/cdk/collections';
import { FormGroup } from '@angular/forms';
import { merge, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { DataService } from 'src/app/services';
import { Tag } from 'src/app/shared';

/**
 * Data source for the InputList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class TagsDataSource extends DataSource<Tag> {
  data: Tag[] | [] = [];
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
  length: number = 0;
  tagListSubject = new Subject<Tag[]>;

  constructor(private dataService: DataService, private filter: FormGroup) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Tag[]> {

    if (this.paginator && this.sort) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      const data$ =  merge(this.tagListSubject.pipe(
        map((data: Tag[]) => {
          this.data = data;
        })
        ), this.paginator.page, this.sort.sortChange, this.filter.valueChanges)
        .pipe(map(() => {
          return this.getPagedData(this.getSortedData(this.getFilteredData([...this.data])));
        }));
        this.fetchTags();
        return data$;
      } else {
      throw Error('Please set the paginator and sort on the data source before connecting.');
    }
  }

  fetchTags() {
    this.dataService.listTagStats().subscribe(tags => {
      this.tagListSubject.next(tags);
    });
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: Tag[]): Tag[] {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    } else {
      return data;
    }
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: Tag[]): Tag[] {

    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'id': return compare(a.tag_id ?? 0, b.tag_id ?? 0, isAsc);
        case 'name': return compare(a.name ?? '', b.name ?? '', isAsc);
        case 'deployments': return compare(a.deployments ?? 0, b.deployments ?? 0, isAsc);
        case 'notes': return compare(a.notes ?? 0, b.notes ?? 0, isAsc);
        case 'created': return compare(a.created_at ?? 0, b.created_at ?? 0, isAsc);
        case 'updated': return compare(a.updated_at ?? 0, b.updated_at ?? 0, isAsc);
        default: return 0;
      }
    });
  }

  private getFilteredData(data: Tag[]): Tag[] {
    let filteredData = data;

    if (this.filter.controls['name'].value) {
      filteredData = filteredData.filter(e => e.name.toLowerCase().includes(this.filter.controls['name'].value.toLowerCase()));
    }
    this.length = filteredData.length;
    return filteredData;
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
