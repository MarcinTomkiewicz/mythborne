import { TestBed } from '@angular/core/testing';

import { Origins } from './origins';

describe('Origins', () => {
  let service: Origins;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Origins);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
