import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FilterStoreService {

  deploymentsFilter = new FormGroup({
    node:             new FormControl<[number]|null>(null),
    tags:             new FormControl<[number]|null>(null),
    type:             new FormControl<[string]|null>(null),
    platform:         new FormControl<[string]|null>(null),
  });

  nodesFilter =       new FormGroup({
    node_label:       new FormControl<string|null>(null),
    type:             new FormControl<[string]|null>(null),
    platform:         new FormControl<[string]|null>(null),
    deployed:         new FormControl<boolean>(true, {nonNullable: true}),
    not_deployed:     new FormControl<boolean>(true, {nonNullable: true})
  });

}
