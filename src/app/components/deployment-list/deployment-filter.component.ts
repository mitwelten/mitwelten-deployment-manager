import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { FilterStoreService } from 'src/app/shared/filter-store.service';
import { DeploymentsDataSource } from './deployments-datasource';

@Component({
  selector: 'app-deployment-filter',
  template: `
<div class="filter-header">
  <h3>Filter</h3>
  <button matSuffix mat-icon-button aria-label="Clear" (click)="filterStore.deploymentsFilter.reset()" matTooltipPosition="before"  matTooltip="Clear filters">
    <mat-icon class="material-symbols-outlined">search_off</mat-icon>
  </button>
</div>
<form [formGroup]="filterStore.deploymentsFilter" class="filter-view">
  <!-- node -->
  <mat-form-field appearance="outline">
    <mat-label>Label / Name</mat-label>
    <input matInput type="text" formControlName="node">
  </mat-form-field>
  <!-- type (select) -->
  <mat-form-field appearance="outline">
    <mat-label>Type</mat-label>
    <mat-select formControlName="type" panelClass="filter">
      <mat-option *ngFor="let type of dataSource.typeOptions" [value]="type">{{type}}</mat-option>
    </mat-select>
  </mat-form-field>
  <!-- platform (select) -->
  <mat-form-field appearance="outline">
    <mat-label>Platform</mat-label>
    <mat-select formControlName="platform" panelClass="filter">
      <mat-option *ngFor="let type of dataSource.platformOptions" [value]="type">{{type}}</mat-option>
    </mat-select>
  </mat-form-field>
  <!-- tags (multiselect) -->
  <mat-form-field appearance="outline">
    <mat-label>Tags</mat-label>
    <mat-select formControlName="tags" multiple panelClass="filter">
      <mat-option *ngFor="let tag of dataSource.tagOptions" [value]="tag.tag_id">{{tag.name}}</mat-option>
    </mat-select>
  </mat-form-field>
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
  grid-template-columns: repeat(4, auto);
}
@media (max-width: 599px) {
  .filter-view {
    grid-template-columns: repeat(2, auto);
  }
}
`
  ]
})
export class DeploymentFilterComponent {

  dataSource: DeploymentsDataSource

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {dataSource: DeploymentsDataSource},
    public filterStore: FilterStoreService) {
      this.dataSource = data.dataSource;
    }

}
