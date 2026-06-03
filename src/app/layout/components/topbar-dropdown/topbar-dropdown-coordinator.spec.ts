import { TestBed } from '@angular/core/testing';
import { TopbarDropdownCoordinator } from './topbar-dropdown-coordinator';

describe('TopbarDropdownCoordinator', () => {
  let coordinator: TopbarDropdownCoordinator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TopbarDropdownCoordinator],
    });

    coordinator = TestBed.inject(TopbarDropdownCoordinator);
  });

  it('keeps only one dropdown open at a time', () => {
    coordinator.toggle('player-notifications');

    expect(coordinator.isOpen('player-notifications')).toBeTrue();
    expect(coordinator.isOpen('staff-notifications')).toBeFalse();

    coordinator.toggle('staff-notifications');

    expect(coordinator.isOpen('player-notifications')).toBeFalse();
    expect(coordinator.isOpen('staff-notifications')).toBeTrue();
  });

  it('closes the active dropdown by id', () => {
    coordinator.toggle('player-notifications');

    coordinator.close('staff-notifications');
    expect(coordinator.isOpen('player-notifications')).toBeTrue();

    coordinator.close('player-notifications');
    expect(coordinator.isOpen('player-notifications')).toBeFalse();
  });
});
