import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSidebar } from './game-sidebar';

describe('GameSidebar', () => {
  let component: GameSidebar;
  let fixture: ComponentFixture<GameSidebar>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameSidebar],
    });

    fixture = TestBed.createComponent(GameSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
