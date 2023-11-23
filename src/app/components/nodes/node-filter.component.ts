import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DataService, FilterStoreService } from 'src/app/services';
import { NodesDataSource } from './nodes-datasource';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-node-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
<div class="filter-header">
  <h3>Filter</h3>
  <button matSuffix mat-icon-button aria-label="Clear" (click)="filterStore.nodesFilter.reset()" matTooltipPosition="before"  matTooltip="Clear filters">
    <mat-icon class="material-symbols-outlined">search_off</mat-icon>
  </button>
</div>
<form [formGroup]="filterStore.nodesFilter" class="filter-view">
  <!-- node -->
  <mat-form-field appearance="outline">
    <mat-label>Label / Name</mat-label>
    <input #node_label matInput type="text" formControlName="node_label">
  </mat-form-field>
  <!-- type (select) -->
  <mat-form-field appearance="outline">
    <mat-label>Type</mat-label>
    <mat-select formControlName="type" panelClass="filter">
      <mat-option>All Types</mat-option>
      <mat-option *ngFor="let type of typeOptions" [value]="type">{{type}}</mat-option>
    </mat-select>
  </mat-form-field>
  <!-- platform (select) -->
  <mat-form-field appearance="outline">
    <mat-label>Platform</mat-label>
    <mat-select formControlName="platform" panelClass="filter">
      <mat-option>All Platforms</mat-option>
      <mat-option *ngFor="let platform of platformOptions" [value]="platform">{{platform}}</mat-option>
    </mat-select>
  </mat-form-field>
  <!-- is deployed (intermediate, boolean) -->
  <div style="margin-top: -18px;">
    <mat-checkbox [checked]="true" formControlName="deployed">Deployed</mat-checkbox>
    <mat-checkbox [checked]="true" formControlName="not_deployed">Not deployed</mat-checkbox>
  </div>
</form>
  `,
  styles: [
    `
.filter-header {
  display: grid;
    grid-template-columns: auto min-content;
    column-gap: 16px;
    margin-bottom: 8px;
    align-items: center;
}
.filter-header h3 {
  margin: 0;
}
.filter-view {
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: auto auto auto min-content;
}
@media (max-width: 599px) {
  .filter-view {
    grid-template-columns: repeat(2, auto);
  }
}
`
  ]
})
export class NodeFilterComponent implements OnInit {

  dataSource: NodesDataSource
  typeOptions: string[] = [];
  platformOptions: string[] = [];

  @ViewChild('node_label', { static: true, read: MatInput })
  inputNodeLabel?: MatInput

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {dataSource: NodesDataSource},
    public filterStore: FilterStoreService,
    private dataService: DataService) {
      this.dataSource = data.dataSource;
    }

  ngOnInit(): void {
    this.inputNodeLabel?.focus();
    this.dataService.getNodeTypeOptions('').subscribe(
      options => this.typeOptions = options.sort(
        (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
      ));
    this.dataService.getNodePlatformOptions('').subscribe(
      options => this.platformOptions = options.sort(
        (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
      ));
  }

}
