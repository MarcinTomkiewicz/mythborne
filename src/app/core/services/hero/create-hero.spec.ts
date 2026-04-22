import { TestBed } from '@angular/core/testing';
import { CreateHero } from './create-hero';

describe('CreateHero', () => {
  let service: CreateHero;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateHero);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
