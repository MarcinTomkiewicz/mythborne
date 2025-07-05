import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCharacter } from './create-character';

describe('CreateCharacter', () => {
  let component: CreateCharacter;
  let fixture: ComponentFixture<CreateCharacter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCharacter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCharacter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
