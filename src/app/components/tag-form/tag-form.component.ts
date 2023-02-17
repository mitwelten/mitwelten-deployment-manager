import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { DataService, Tag } from 'src/app/shared';

@Component({
  selector: 'app-tag-form',
  templateUrl: './tag-form.component.html',
  styleUrls: ['./tag-form.component.css']
})
export class TagFormComponent implements OnInit {
  tagForm =          new FormGroup({
    tag_id:          new FormControl<number|null>(null),
    name:            new FormControl<string|null>(null, {
      validators: [Validators.required],
    }),
  });

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(
    public dialogRef: MatDialogRef<TagFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Tag,
    private dataService: DataService,
    // TODO: implement validator that allows same tag but not duplicate with other
    // private nodeValidator: NodeValidator,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.tagForm.patchValue(this.data);
  }

  getErrorMessage() {

    if (this.tagForm.controls.name.hasError('required')) {
      return 'You must enter a value';
    }
    else if (this.tagForm.controls.name.hasError('isDuplicate')) {
      return 'Another tag with this name already exists';
    }
    else {
      return 'Validation error'
    }
  }

  submit() {
    this.dataService.putTag(this.tagForm.value).subscribe(tag_id => {
      this.snackBar.open('Tag updated', '🎉', this.snackBarConfig);
      this.dialogRef.close(true);
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
