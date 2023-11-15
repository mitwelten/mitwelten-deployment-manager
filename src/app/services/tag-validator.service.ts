import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { Tag } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class UniqueTagValidator  implements AsyncValidator {

  constructor(private dataService: DataService) { }

  validate(control: AbstractControl<Tag>): Observable<ValidationErrors | null> {
    if (control.value.name === null) {
      return of(null)
    } else {
      return this.dataService.isTagUnique(control.value).pipe(
        map(isUnique => (isUnique ? null : { isDuplicate: true })),
        catchError(() => of(null))
      );
    }
  }
}
