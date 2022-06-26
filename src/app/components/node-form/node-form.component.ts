import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ActivatedRouteSnapshot, ActivationEnd, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared';
import { NodeValidator } from 'src/app/shared/node-validator.service';

@Component({
  selector: 'app-node-form',
  templateUrl: './node-form.component.html',
  styleUrls: ['./node-form.component.css']
})
export class NodeFormComponent implements OnInit, OnDestroy {

  title = 'Add a new node';
  mode: 'edit'|'add' = 'add';
  routerEvents$: Subscription;

  nodeForm =          new FormGroup({
    node_id:          new FormControl<number|null>(null),
    node_label:       new FormControl<string|null>(null, {
      validators:  [Validators.required, Validators.pattern('^\\d{4}-\\d{4}$')]
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
  }, {
    asyncValidators: [this.nodeValidator.validate.bind(this.nodeValidator)]
  })

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private nodeValidator: NodeValidator,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {

    this.initialise(this.route.snapshot.params);

    this.routerEvents$ = this.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        this.initialise(event.snapshot.params)
      }
    });

  }

  ngOnDestroy(): void {
    this.routerEvents$.unsubscribe();
  }

  private initialise(params: Params) {
    if ('id' in params) {
      this.mode = 'edit';
      const id = Number(params['id']);
      this.dataService.getNodeById(id).subscribe(node => {
        console.log('getNodeById subscription firing');

        this.title = `Edit Node ${node.node_label} (${node.node_id})`
        this.nodeForm.patchValue(node);
      });
    } else {
      this.mode = 'add';
      this.title = 'Add a new Node';
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
    this.dataService.putNode(this.nodeForm.value).subscribe(node_id => {
      const msg = this.mode == 'add' ? 'Node added.' : 'Node changes saved.';
      this.snackBar.open(msg, '🎉', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      this.router.navigate(['/nodes/edit', node_id]);
    });
  }

}
