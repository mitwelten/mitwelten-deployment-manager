import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { DataService } from './data.service';
import { DeploymentFormValue, mapDeploymentFromValue } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class NoOverlapValidator implements AsyncValidator {

  constructor(private dataService: DataService) { }

  validate(control: AbstractControl<DeploymentFormValue>): Observable<ValidationErrors | null> {

    const deployment = mapDeploymentFromValue(control.value);

    return this.dataService.isDeploymentOverlapping(deployment).pipe(
      map(isOverlapping => (isOverlapping ? { isOverlapping: true } : null)),
      catchError(() => of(null))
    );
  }
}
