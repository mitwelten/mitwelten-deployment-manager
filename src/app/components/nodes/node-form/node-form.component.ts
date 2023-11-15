import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ActivatedRoute, ActivationEnd, Params, Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, filter, Observable, of, startWith, Subscription, switchMap } from 'rxjs';
import { DataService, NodeValidator } from 'src/app/services';
import { DeleteConfirmDialogComponent } from '../../delete-confirm-dialog.component';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-node-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    RouterLink,
    MatDialogClose,
    MatAutocompleteModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './node-form.component.html',
  styleUrl: './node-form.component.css'
})
export class NodeFormComponent implements OnInit, OnDestroy {

  title?: string;
  mode: 'edit'|'add' = 'add';
  routerEvents$?: Subscription;

  nodeForm =          new FormGroup({
    node_id:          new FormControl<number|undefined>(undefined, { nonNullable: true }),
    node_label:       new FormControl<string|undefined>(undefined, { nonNullable: true }),
    type:             new FormControl<string|undefined>(undefined, {
      nonNullable: true, validators: [Validators.required]
    }),
    serial_number:    new FormControl<string|undefined>(undefined, { nonNullable: true }),
    description:      new FormControl<string|undefined>(undefined, { nonNullable: true }),
    platform:         new FormControl<string|undefined>(undefined, { nonNullable: true }),
    connectivity:     new FormControl<string|undefined>(undefined, { nonNullable: true }),
    power:            new FormControl<string|undefined>(undefined, { nonNullable: true }),
    hardware_version: new FormControl<string|undefined>(undefined, { nonNullable: true }),
    software_version: new FormControl<string|undefined>(undefined, { nonNullable: true }),
    firmware_version: new FormControl<string|undefined>(undefined, { nonNullable: true }),
    labelValidator:   new FormGroup({
      node_id:          new FormControl<number|undefined>(undefined, { nonNullable: true }),
      node_label:       new FormControl<string|undefined>(undefined, {
        nonNullable: true, validators: [Validators.required, Validators.pattern('^\\d{4}-\\d{4}$')]
      })
    }, {
      asyncValidators: [this.nodeValidator.validate.bind(this.nodeValidator)]
    })
  });

  typeOptions?: Observable<string[]>;
  platformOptions?: Observable<string[]>;
  connectivityOptions?: Observable<string[]>;
  powerOptions?: Observable<string[]>;

  @ViewChild('deleteError') deleteErrorDialog?: TemplateRef<never>;
  @ViewChild(CdkTrapFocus, { static: true }) focusTrap?: CdkTrapFocus;
  @ViewChild('generate', { static: true, read: MatIconButton }) buttonGenerate?: MatIconButton;

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
    this.nodeForm.controls.labelValidator.statusChanges.subscribe(() => {
      const errors = Object.assign({},
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
      startWith(''), debounceTime(250), filter(v => v !== null),
      switchMap(v => this.dataService.getNodeTypeOptions(v!))
    );
    this.platformOptions = this.nodeForm.controls.platform.valueChanges.pipe(
      startWith(''), debounceTime(250), filter(v => v !== null),
      switchMap(v => this.dataService.getNodePlatformOptions(v!))
    );
    this.connectivityOptions = this.nodeForm.controls.connectivity.valueChanges.pipe(
      startWith(''), debounceTime(250), filter(v => v !== null),
      switchMap(v => this.dataService.getNodeConnectivityOptions(v!))
    );
    this.powerOptions = this.nodeForm.controls.power.valueChanges.pipe(
      startWith(''), debounceTime(250), filter(v => v !== null),
      switchMap(v => this.dataService.getNodePowerOptions(v!))
    );

    // in addition to cdkFocusInitial, this will show the label
    this.buttonGenerate?.focus('keyboard');
  }

  ngOnDestroy(): void {
    this.routerEvents$?.unsubscribe();
  }

  private initialise(params: Params) {

    this.mode = 'add';
    this.title = 'Add a new Node';

    if ('id' in params) {
      const id = Number(params['id']);
      this.dataService.getNodeById(id).subscribe(node => {
        if (node !== null) {
          this.mode = 'edit';
          this.focusTrap?.focusTrap.focusFirstTabbableElement();
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
          this.dataService.deleteNode(id!).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 409) {
                this.dialog.open(this.deleteErrorDialog!, { data: node_label });
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

