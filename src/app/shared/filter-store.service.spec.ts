import { TestBed } from '@angular/core/testing';

import { FilterStoreService } from './filter-store.service';

describe('FilterStoreService', () => {
  let service: FilterStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
