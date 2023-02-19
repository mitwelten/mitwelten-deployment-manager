import { TestBed } from '@angular/core/testing';

import { UniqueTagValidator } from './tag-validator.service';

describe('TagValidatorService', () => {
  let service: UniqueTagValidator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniqueTagValidator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
