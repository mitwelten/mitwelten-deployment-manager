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

  tagsFilter =        new FormGroup({
    name:             new FormControl<[string]|null>(null),
  });

  envFilter =         new FormGroup({
    environment_id:   new FormControl<number|null>(null),
    timestamp_s:      new FormControl<string|null>(null),
    timestamp_e:      new FormControl<string|null>(null),
    /* location:         new FormGroup({
      lat:            new FormControl<number|null>(null),
      lon:            new FormControl<number|null>(null),
    }),
    proximity:        new FormControl<number|null>(null), */
    attribute_01_s:   new FormControl<number>( 0, {nonNullable: true}),
    attribute_01_e:   new FormControl<number>(10, {nonNullable: true}),
    attribute_02_s:   new FormControl<number>( 0, {nonNullable: true}),
    attribute_02_e:   new FormControl<number>(10, {nonNullable: true}),
    attribute_03_s:   new FormControl<number>( 0, {nonNullable: true}),
    attribute_03_e:   new FormControl<number>(10, {nonNullable: true}),
    attribute_04_s:   new FormControl<number>( 0, {nonNullable: true}),
    attribute_04_e:   new FormControl<number>(10, {nonNullable: true}),
    attribute_05_s:   new FormControl<number>( 0, {nonNullable: true}),
    attribute_05_e:   new FormControl<number>(10, {nonNullable: true}),
    attribute_06_s:   new FormControl<number>( 0, {nonNullable: true}),
    attribute_06_e:   new FormControl<number>(10, {nonNullable: true}),
    attribute_07_s:   new FormControl<number>( 0, {nonNullable: true}),
    attribute_07_e:   new FormControl<number>(10, {nonNullable: true}),
    attribute_08_s:   new FormControl<number>( 0, {nonNullable: true}),
    attribute_08_e:   new FormControl<number>(10, {nonNullable: true}),
    attribute_09_s:   new FormControl<number>( 0, {nonNullable: true}),
    attribute_09_e:   new FormControl<number>(10, {nonNullable: true}),
    attribute_10_s:   new FormControl<number>( 0, {nonNullable: true}),
    attribute_10_e:   new FormControl<number>(10, {nonNullable: true}),
  });

}
