import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ActivationEnd, Params, Router } from '@angular/router';
import { Observable, Subscription, startWith, switchMap, debounceTime } from 'rxjs';
import { DataService } from 'src/app/shared';
import { NodeValidator } from 'src/app/shared/node-validator.service';

@Component({
  selector: 'app-node-form',
  templateUrl: './node-form.component.html',
  styleUrls: ['./node-form.component.css']
})
export class NodeFormComponent implements OnInit, OnDestroy {

  title: string;
  mode: 'edit'|'add' = 'add';
  routerEvents$: Subscription;

  nodeForm =          new FormGroup({
    node_id:          new FormControl<number|null>(null),
    node_label:       new FormControl<string|null>(null),
    type:             new FormControl<string|null>(null, {
      validators: [Validators.required]
    }),
    serial_number:    new FormControl<string|null>(null),
    description:      new FormControl<string|null>(null),
    platform:         new FormControl<string|null>(null),
    connectivity:     new FormControl<string|null>(null),
    power:            new FormControl<string|null>(null),
    hardware_version: new FormControl<string|null>(null),
    software_version: new FormControl<string|null>(null),
    firmware_version: new FormControl<string|null>(null),
    labelValidator:   new FormGroup({
      node_id:          new FormControl<number|null>(null),
      node_label:       new FormControl<string|null>(null, {
        validators: [Validators.required, Validators.pattern('^\\d{4}-\\d{4}$')]
      })
    }, {
      asyncValidators: [this.nodeValidator.validate.bind(this.nodeValidator)]
    })
  });

  typeOptions: Observable<string[]>;
  platformOptions: Observable<string[]>;
  connectivityOptions: Observable<string[]>;
  powerOptions: Observable<string[]>;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private nodeValidator: NodeValidator,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {

    /*
    Proxy FormGroup with async validator, adding node_id if present to the
    node_label check: If node_id present: check node_label duplicates
    _except_ in record with node_id.

    Like this, the Node object signature stays intact for patching in values
    and sending out to the backend.
    */
    this.nodeForm.controls.node_label.valueChanges.subscribe(node_label => {
      const c = this.nodeForm.controls.labelValidator.controls
      c.node_label.setValue(node_label);
      if (this.nodeForm.controls.node_id.value !== null) {
        c.node_id.setValue(this.nodeForm.controls.node_id.value)
      }
    });

    // Copy the errors of the proxy back to the original FormControl
    this.nodeForm.controls.labelValidator.statusChanges.subscribe(status => {
      let errors = Object.assign({},
        this.nodeForm.controls.labelValidator.errors,
        this.nodeForm.controls.labelValidator.controls.node_label.errors);
      this.nodeForm.controls.node_label.setErrors(
        Object.keys(errors).length === 0 ? null : errors,
        { emitEvent: true });
    })

    this.initialise(this.route.snapshot.params);

    this.routerEvents$ = this.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        this.initialise(event.snapshot.params)
      }
    });

    this.typeOptions = this.nodeForm.controls.type.valueChanges.pipe(
      startWith(''), debounceTime(250),
      switchMap(v => this.dataService.getNodeTypeOptions(v))
    );
    this.platformOptions = this.nodeForm.controls.platform.valueChanges.pipe(
      startWith(''), debounceTime(250),
      switchMap(v => this.dataService.getNodePlatformOptions(v))
    );
    this.connectivityOptions = this.nodeForm.controls.connectivity.valueChanges.pipe(
      startWith(''), debounceTime(250),
      switchMap(v => this.dataService.getNodeConnectivityOptions(v))
    );
    this.powerOptions = this.nodeForm.controls.power.valueChanges.pipe(
      startWith(''), debounceTime(250),
      switchMap(v => this.dataService.getNodePowerOptions(v))
    );
  }

  ngOnDestroy(): void {
    this.routerEvents$.unsubscribe();
  }

  private initialise(params: Params) {

    this.mode = 'add';
    this.title = 'Add a new Node';

    if ('id' in params) {
      const id = Number(params['id']);
      this.dataService.getNodeById(id).subscribe(node => {
        if (node !== null) {
          this.mode = 'edit';
          this.title = `Edit Node ${node.node_label} (${node.node_id})`
          this.nodeForm.patchValue(node);
        }
      });
    }
  }

  generateLabel() {
    const part = () => String(Math.round(5000*Math.random())).padStart(4, '0');
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

  delete() {
    const id = this.nodeForm.controls.node_id.value;
    if (id !== null) {
      this.dataService.deleteNode(id).subscribe(response => {
        this.snackBar.open('Node deleted', '😵', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        this.router.navigate(['/nodes']);
      });
    }
  }

}
