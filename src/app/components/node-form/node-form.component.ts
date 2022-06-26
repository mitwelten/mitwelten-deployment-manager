import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DataService, Node } from 'src/app/shared';
import { NodeValidator } from 'src/app/shared/node-validator.service';

@Component({
  selector: 'app-node-form',
  templateUrl: './node-form.component.html',
  styleUrls: ['./node-form.component.css']
})
export class NodeFormComponent implements OnInit {

  title = 'EditAdd a new node'

  nodeForm =          new FormGroup({
    node_label:       new FormControl<string|null>(null, {
      validators:  [Validators.required, Validators.pattern('^\\d{4}-\\d{4}$')],
      asyncValidators: [this.nodeValidator.validate.bind(this.nodeValidator)]
    }),
    type:             new FormControl<string|null>(null, {validators: [Validators.required]}),
    serial_number:    new FormControl<string|null>(null),
    description:      new FormControl<string|null>(null),
    platform:         new FormControl<string|null>(null),
    connectivity:     new FormControl<string|null>(null),
    power:            new FormControl<string|null>(null),
    hardware_version: new FormControl<string|null>(null),
    software_version: new FormControl<string|null>(null),
    firmware_version: new FormControl<string|null>(null),
  })

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private nodeValidator: NodeValidator,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    if ('id' in this.route.snapshot.params) {
      const id = Number(this.route.snapshot.params['id']);
    }
  }

  generateLabel() {
    const part = () => String(Math.round(Math.random() * 5000)).padStart(4, '0');
    this.nodeForm.controls.node_label.setValue(`${part()}-${part()}`);
  }

  getErrorMessage() {

    if (this.nodeForm.controls.node_label.hasError('required')) {
      return 'You must enter a value';
    }
    else if (this.nodeForm.controls.node_label.hasError('pattern')) {
      return 'Node doesn\'t match pattern "0000-0000"';
    }
    else if (this.nodeForm.controls.node_label.hasError('isDuplicate')) {
      return 'Node label is not unique';
    }
    else {
      return 'Validation error'
    }
  }

  submit() {
    this.dataService.putNode(this.nodeForm.value).subscribe(r => {
      this.nodeForm.reset();
      this.snackBar.open('Node added', '🎉', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      })
    });
  }

}
