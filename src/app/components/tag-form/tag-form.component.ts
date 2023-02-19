import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { DataService, Tag, UniqueTagValidator } from 'src/app/shared';

@Component({
  selector: 'app-tag-form',
  templateUrl: './tag-form.component.html',
  styleUrls: ['./tag-form.component.css']
})
export class TagFormComponent implements OnInit {
  tagForm =          new FormGroup({
    tag_id:          new FormControl<number|null>(null),
    name:            new FormControl<string|null>(null),
    tagValidator:    new FormGroup({
      tag_id:        new FormControl<number|null>(null),
      name:          new FormControl<string|null>(null, {
        validators: [Validators.required]
      }),
    }, {
      asyncValidators: [this.tagValidator.validate.bind(this.tagValidator)]
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
    private tagValidator: UniqueTagValidator,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.tagForm.controls.name.valueChanges.subscribe(name => {
      const c = this.tagForm.controls.tagValidator.controls
      c.name.setValue(name);
      if (this.tagForm.controls.tag_id.value !== null) {
        c.tag_id.setValue(this.tagForm.controls.tag_id.value)
      }
    });

    // Copy the errors of the proxy back to the original FormControl
    this.tagForm.controls.tagValidator.statusChanges.subscribe(status => {
      let errors = Object.assign({},
        this.tagForm.controls.tagValidator.errors,
        this.tagForm.controls.tagValidator.controls.name.errors);
      this.tagForm.controls.name.setErrors(
        Object.keys(errors).length === 0 ? null : errors,
        { emitEvent: true });
    });

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
