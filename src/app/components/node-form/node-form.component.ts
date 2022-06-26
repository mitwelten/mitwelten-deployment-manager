import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, ActivationEnd, Params, Router } from '@angular/router';
import { Observable, Subscription, startWith, switchMap, debounceTime, catchError, of } from 'rxjs';
import { DataService } from 'src/app/shared';
import { NodeValidator } from 'src/app/shared/node-validator.service';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';

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

  @ViewChild('deleteError') deleteErrorDialog: TemplateRef<any>;

  snackBarConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private nodeValidator: NodeValidator,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
      this.snackBar.open(msg, '🎉', this.snackBarConfig);
      this.router.navigate(['/nodes/edit', node_id]);
    });
  }

  delete() {
    const id = this.nodeForm.controls.node_id.value;
    const node_label = this.nodeForm.controls.node_label.value;

    if (id !== null) {
      const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: { recordType: 'Node', recordLabel: node_label }
      });

      dialogRef.afterClosed().subscribe(response => {
        if (response === true) {
          this.dataService.deleteNode(id).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 409) {
                this.dialog.open(this.deleteErrorDialog, { data: node_label });
              }
              return of(false);
          })).subscribe(response => {
            if (response === true) {
              this.snackBar.open('Node deleted', '😵', this.snackBarConfig);
              this.router.navigate(['/nodes']);
            } else {
              this.snackBar.open('Node NOT deleted', '🙈', this.snackBarConfig);
            }
          });
        }
      });
    }
  }

}
