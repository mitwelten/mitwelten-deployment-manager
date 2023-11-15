import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';

import { DataService } from './data.service';
import { Node } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class NodeValidator implements AsyncValidator {

  constructor(private dataService: DataService) { }

  validate(control: AbstractControl<Node>): Observable<ValidationErrors | null> {
    if ('node_label' in control.value) {
      if (control.value.node_label === null) {
        return of(null)
      }
      // check the whole group to include the id in case we're editing a record
      return this.dataService.isNodeUnique(control.value).pipe(
        map(isUnique => (isUnique ? null : { isDuplicate: true })),
        catchError(() => of(null))
      );
    } else {
      return of(null)
    }
  }
}
