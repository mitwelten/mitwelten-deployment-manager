import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <h1 mat-dialog-title>Deleting {{ data.recordType }} {{ data.recordLabel }}</h1>
    <div mat-dialog-content>
      <p>Please confirm that you want to delete {{ data.recordType }} {{ data.recordLabel }}</p>
    </div>
    <div mat-dialog-actions>
      <button mat-stroked-button (click)="cancel()">Cancel</button>
      <button mat-stroked-button color="warn" [mat-dialog-close]="true" cdkFocusInitial>Confirm</button>
    </div>

  `,
  styles: ``
})
export class DeleteConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { recordType: string, recordLabel: string },
  ) { }

  cancel() {
    this.dialogRef.close(false);
  }

}
