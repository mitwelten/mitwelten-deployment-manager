import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class NodeValidator implements AsyncValidator {

  constructor(private dataService: DataService) { }

  validate(control: AbstractControl<any, any>): Observable<ValidationErrors | null> {
    if ('node_label' in control.value) {
      // check the whole group to include the id in case we're editing a record
      return this.dataService.isNodeUnique(control.value).pipe(
        map(isUnique => (isUnique ? null : { isDuplicate: true })),
        catchError(() => of(null))
      );
    } else {
      return null
    }
  }
}
