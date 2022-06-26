import { TestBed } from '@angular/core/testing';

import { NoOverlapValidator } from './overlap-validator.service';

describe('NoOverlapValidator', () => {
  let service: NoOverlapValidator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoOverlapValidator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
