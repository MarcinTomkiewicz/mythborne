import { TestBed } from '@angular/core/testing';

import { HeroFactory } from './hero-factory';

describe('HeroFactory', () => {
  let service: HeroFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroFactory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
