import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { catchError, map, Observable, of } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class NoOverlapValidator implements AsyncValidator {

  constructor(private dataService: DataService) { }

  validate(control: AbstractControl<any, any>): Observable<ValidationErrors | null> {

    const v = control.value;

    const deployment = {
      node_id: v.node_id,
      deployment_id: v.deployment_id,
      period: {
        start: v.period_start,
        end:   v.period_end
      },
      description: v.description,
      location: {
        lat: v.lat,
        lon: v.lon
      }
    };

    return this.dataService.isDeploymentOverlapping(deployment).pipe(
      map(isOverlapping => (isOverlapping ? { isOverlapping: true } : null)),
      catchError(() => of(null))
    );
  }
}
