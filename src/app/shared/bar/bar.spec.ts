import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bar } from './bar';

describe('Bar', () => {
  let component: Bar;
  let fixture: ComponentFixture<Bar>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Bar]
    });

    fixture = TestBed.createComponent(Bar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
