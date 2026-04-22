import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCharacterPage } from './create-character-page';

describe('CreateCharacterPage', () => {
  let component: CreateCharacterPage;
  let fixture: ComponentFixture<CreateCharacterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCharacterPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCharacterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
