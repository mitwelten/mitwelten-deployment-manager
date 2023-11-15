import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { DataService, UniqueTagValidator } from 'src/app/services';
import { Tag, } from 'src/app/shared';

@Component({
  selector: 'app-tag-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './tag-form.component.html',
  styleUrl: './tag-form.component.css'
})
export class TagFormComponent implements OnInit {
  tagForm =          new FormGroup({
    tag_id:          new FormControl<number|undefined>(undefined, { nonNullable: true }),
    name:            new FormControl<string|undefined>(undefined, { nonNullable: true }),
    tagValidator:    new FormGroup({
      tag_id:        new FormControl<number|undefined>(undefined, { nonNullable: true }),
      name:          new FormControl<string|undefined>(undefined, {
        nonNullable: true, validators: [Validators.required]
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
    this.tagForm.controls.tagValidator.statusChanges.subscribe(() => {
      const errors = Object.assign({},
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
    this.dataService.putTag(this.tagForm.value).subscribe(() => {
      this.snackBar.open('Tag updated', '🎉', this.snackBarConfig);
      this.dialogRef.close(true);
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
