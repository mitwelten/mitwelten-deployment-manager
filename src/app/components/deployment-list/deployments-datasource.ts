import { DataSource } from '@angular/cdk/collections';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService, Deployment } from 'src/app/shared';

/**
 * Data source for the InputList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class DeploymentsDataSource extends DataSource<Deployment> {
  data: Deployment[] | [] = [];
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
  filter: FormGroup;
  length: number = 0;
  tagOptions: {id: number, name: string}[];
  // nodeOptions: {id: number, name: string}[];
  typeOptions: string[];
  platformOptions: string[];

  constructor(private dataService: DataService) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Deployment[]> {

    if (this.paginator && this.sort) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(this.dataService.listDeployments().pipe(map((data: Deployment[]) => {
        // this.nodeOptions = (<{ id: number; name: string; }[]>data.map((e: any) => ({id: e.node_id, name: e.node.node_label}) ))
        // .flat()
        // .reduce((u, i) => u.filter(t => t.id === i.id).length ? u : [...u, i], [])
        // .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        this.tagOptions = data.map(d => d.tags).flat()
          .reduce((u, i) => u.filter(t => t.id === i.id).length ? u : [...u, i], [])
          .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

        this.typeOptions = ([...new Set(data.map(d => d.node.type))])
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        this.platformOptions = ([...new Set(data.filter(d => d.node.platform).map(d => d.node.platform))])
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        this.data = data;
      })), this.paginator.page, this.sort.sortChange, this.filter.valueChanges)
        .pipe(map(() => {
          return this.getPagedData(this.getSortedData(this.getFilteredData([...this.data])));
        }));
    } else {
      throw Error('Please set the paginator and sort on the data source before connecting.');
    }
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
  private getPagedData(data: Deployment[]): Deployment[] {
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
  private getSortedData(data: Deployment[]): Deployment[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'node_label': return compare(a.node.node_label ?? '', b.node.node_label ?? '', isAsc);
        case 'type': return compare(a.node.type ?? '', b.node.type ?? '', isAsc);
        case 'platform': return compare(a.node.platform ?? '', b.node.platform ?? '', isAsc);
        case 'description': return compare(a.description ?? '', b.description ?? '', isAsc);
        case 'period_start': return compare(a.period.start ?? '', b.period.start ?? '', isAsc);
        case 'period_end': return compare(a.period.end ?? '99999', b.period.end ?? '99999', isAsc);
        default: return 0;
      }
    });
  }

  private getFilteredData(data: Deployment[]): Deployment[] {
    let filteredData = data;
    if (this.filter.controls['tags'].value && this.filter.controls['tags'].value.length > 0) {
      filteredData = filteredData.filter(
        e => e.tags.filter(
          t => this.filter.controls['tags'].value.includes(t.id)
        ).length);
    }
    if (this.filter.controls['node'].value) {
      filteredData = filteredData.filter(e => e.node.node_label.includes(this.filter.controls['node'].value));
    }
    // if (this.filter.controls['nodes'].value && this.filter.controls['nodes'].value.length) {
    //   filteredData = filteredData.filter(e => this.filter.controls['nodes'].value.includes(e.node_id));
    // }
    if (this.filter.controls['type'].value && this.filter.controls['type'].value.length > 0) {
      filteredData = filteredData.filter(e => this.filter.controls['type'].value.includes(e.node.type));
    }
    if (this.filter.controls['platform'].value && this.filter.controls['platform'].value.length > 0) {
      filteredData = filteredData.filter(e => this.filter.controls['platform'].value.includes(e.node.platform));
    }

    this.length = filteredData.length;
    return filteredData;
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
