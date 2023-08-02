import { DataSource } from '@angular/cdk/collections';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataService, Deployment, Environment } from 'src/app/shared';

import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment, Moment} from 'moment';
const moment = _rollupMoment || _moment;

/**
 * Data source for the InputList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class EnvironmentsDataSource extends DataSource<Environment> {
  data: Environment[] | [] = [];
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
  filter: FormGroup;
  length: number = 0;
  EnvironmentListSubject = new Subject<Environment[]>;

  constructor(private dataService: DataService) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Environment[]> {
    const environments$ = this.EnvironmentListSubject.pipe(
      tap((data: Environment[]) => this.data = data)
    );
    let data$: Observable<Environment[]>;
    if (this.paginator && this.sort) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      data$ = merge(environments$, this.paginator.page, this.sort.sortChange, this.filter.valueChanges)
        .pipe(map(() => {
          return this.getPagedData(this.getSortedData(this.getFilteredData([...this.data])));
        }));
    } else {
      // datasource without paginator and sorting for map display
      data$ = merge(environments$, this.filter.valueChanges)
        .pipe(map(() => {
          return this.getFilteredData([...this.data]);
        }));
    }
    this.fetchEnvironments();
    return data$;
  }

  fetchEnvironments() {
    this.dataService.listEnvEntries().subscribe(environments => {
      this.EnvironmentListSubject.next(environments);
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
  private getPagedData(data: Environment[]): Environment[] {
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
  private getSortedData(data: Environment[]): Environment[] {

    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'environment_id': return compare(a.environment_id ?? 0, b.environment_id ?? 0, isAsc);
        case 'timestamp': return compare(a.timestamp ?? 0, b.timestamp ?? 0, isAsc);
        case 'attribute_01': return compare(a.attribute_01 ?? 0, b.attribute_01 ?? 0, isAsc);
        case 'attribute_02': return compare(a.attribute_02 ?? 0, b.attribute_02 ?? 0, isAsc);
        case 'attribute_03': return compare(a.attribute_03 ?? 0, b.attribute_03 ?? 0, isAsc);
        case 'attribute_04': return compare(a.attribute_04 ?? 0, b.attribute_04 ?? 0, isAsc);
        case 'attribute_05': return compare(a.attribute_05 ?? 0, b.attribute_05 ?? 0, isAsc);
        case 'attribute_06': return compare(a.attribute_06 ?? 0, b.attribute_06 ?? 0, isAsc);
        case 'attribute_07': return compare(a.attribute_07 ?? 0, b.attribute_07 ?? 0, isAsc);
        case 'attribute_08': return compare(a.attribute_08 ?? 0, b.attribute_08 ?? 0, isAsc);
        case 'attribute_09': return compare(a.attribute_09 ?? 0, b.attribute_09 ?? 0, isAsc);
        case 'attribute_10': return compare(a.attribute_10 ?? 0, b.attribute_10 ?? 0, isAsc);
        case 'created': return compare(a.created_at ?? 0, b.created_at ?? 0, isAsc);
        case 'updated': return compare(a.updated_at ?? 0, b.updated_at ?? 0, isAsc);
        default: return 0;
      }
    });
  }

  private getFilteredData(data: Environment[]): Environment[] {
    let filteredData = data;

    const attrKeys = ['attribute_01', 'attribute_02', 'attribute_03', 'attribute_04', 'attribute_05', 'attribute_06', 'attribute_07', 'attribute_08', 'attribute_09', 'attribute_10'];

    if (this.filter.controls['environment_id'].value !== null) {
      filteredData = filteredData.filter(e => e.environment_id === this.filter.controls['environment_id'].value);
    }

    if (this.filter.controls['timestamp_s'].value !== null) {
      filteredData = filteredData.filter(e => moment.utc(e.timestamp).local() >= this.filter.controls['timestamp_s'].value);
    }

    if (this.filter.controls['timestamp_e'].value !== null) {
      filteredData = filteredData.filter(e => moment.utc(e.timestamp).local() <= this.filter.controls['timestamp_e'].value);
    }

    attrKeys.forEach(k => {
      if (this.filter.controls[k+'_s'].value !== null)
      filteredData = filteredData.filter(e => e[<keyof Environment>k] >= this.filter.controls[k+'_s'].value);
      if (this.filter.controls[k+'_e'].value !== null)
      filteredData = filteredData.filter(e => e[<keyof Environment>k] <= this.filter.controls[k+'_e'].value);
    })

    this.length = filteredData.length;
    return filteredData;
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
