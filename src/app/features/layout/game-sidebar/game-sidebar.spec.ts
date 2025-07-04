import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSidebar } from './game-sidebar';

describe('GameSidebar', () => {
  let component: GameSidebar;
  let fixture: ComponentFixture<GameSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
