import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCharacterPage } from './create-character-page';

describe('CreateCharacterPage', () => {
  let component: CreateCharacterPage;
  let fixture: ComponentFixture<CreateCharacterPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateCharacterPage],
    });

    fixture = TestBed.createComponent(CreateCharacterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
