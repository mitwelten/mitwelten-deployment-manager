import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { DataService, Node } from 'src/app/shared';
import { NodeComponent } from '../node/node.component';
import { NodesDataSource } from './list-datasource';

@Component({
  selector: 'app-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.css']
})
export class NodeListComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Node>;
  dataSource: NodesDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['action', 'node_label', 'type', 'platform', 'description'];

  constructor(
    private dataService: DataService,
    private dialog: MatDialog,
  ) {
    this.dataSource = new NodesDataSource(dataService);
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
  }

  detail(node: Node) {
    this.dialog.open(NodeComponent, {
      data: node
    });
  }

}
