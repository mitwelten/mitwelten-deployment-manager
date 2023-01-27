import { DataSource } from '@angular/cdk/collections';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService, Node } from 'src/app/shared';

/**
 * Data source for the InputList view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class NodesDataSource extends DataSource<Node> {
  data: Node[] | [] = [];
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
  filter: FormGroup;
  length: number = 0;

  constructor(private dataService: DataService) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Node[]> {


    if (this.paginator && this.sort) {
      // Combine everything that affects the rendered data into one update
      // stream for the data-table to consume.
      return merge(this.dataService.listNodes().pipe(map((data: any) => {
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
  private getPagedData(data: Node[]): Node[] {
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
  private getSortedData(data: Node[]): Node[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'node_label': return compare(a.node_label, b.node_label, isAsc);
        case 'type': return compare(a.type, b.type, isAsc);
        case 'platform': return compare(a.platform ?? '', b.platform ?? '', isAsc);
        case 'description': return compare(a.description ?? '', b.description ?? '', isAsc);
        default: return 0;
      }
    });
  }

  private getFilteredData(data: Node[]): Node[] {
    let filteredData = data;
    if (this.filter.controls['node_label'].value) {
      filteredData = filteredData.filter(e => e.node_label.includes(this.filter.controls['node_label'].value))
    }
    if (this.filter.controls['type'].value && this.filter.controls['type'].value.length > 0) {
      filteredData = filteredData.filter(e => this.filter.controls['type'].value.includes(e.type));
    }
    if (this.filter.controls['platform'].value && this.filter.controls['platform'].value.length > 0) {
      filteredData = filteredData.filter(e => this.filter.controls['platform'].value.includes(e.platform));
    }
    if (this.filter.controls['deployed'].value && this.filter.controls['not_deployed'].value) {
      // no-op, default
    } else if (this.filter.controls['deployed'].value) {
      filteredData = filteredData.filter(e => e.deployment_count > 0);
    } else if (this.filter.controls['not_deployed'].value) {
      filteredData = filteredData.filter(e => e.deployment_count === 0);
    } else {
      return [];
    }
    this.length = filteredData.length;
    return filteredData;
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
