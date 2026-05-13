import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { SelectedGameServer } from '../../interfaces/server/active-server.interface';
import { ActiveHeroState } from '../../interfaces/hero/active-hero.interface';
import { HeroExperienceProgress } from '../../types/hero.types';
import { ActiveHero } from './active-hero';
import { ActiveHeroVitalsState } from './active-hero-vitals-state';
import { Hero } from './hero';
import { HeroHealthState, HeroHealthStateReadModel } from './hero-health-state';

describe('ActiveHeroVitalsState', () => {
  let service: ActiveHeroVitalsState;
  let hero: jasmine.SpyObj<Hero>;
  let heroHealthState: jasmine.SpyObj<HeroHealthState>;
  let activeHeroState: ReturnType<typeof signal<ActiveHeroState | null>>;

  beforeEach(() => {
    activeHeroState = signal<ActiveHeroState | null>(stateForHero('hero-1'));
    hero = jasmine.createSpyObj<Hero>('Hero', ['getHeroExperienceProgress']);
    heroHealthState = jasmine.createSpyObj<HeroHealthState>('HeroHealthState', [
      'getHeroHealthState',
    ]);
    hero.getHeroExperienceProgress.and.returnValue(of(experienceProgress()));
    heroHealthState.getHeroHealthState.and.returnValue(of(healthState()));

    TestBed.configureTestingModule({
      providers: [
        ActiveHeroVitalsState,
        { provide: ActiveHero, useValue: { state: activeHeroState.asReadonly() } },
        { provide: Hero, useValue: hero },
        { provide: HeroHealthState, useValue: heroHealthState },
      ],
    });

    service = TestBed.inject(ActiveHeroVitalsState);
  });

  it('maps DB-owned current and max health with XP progress', () => {
    service.load();

    expect(heroHealthState.getHeroHealthState).toHaveBeenCalledWith('hero-1');
    expect(hero.getHeroExperienceProgress).toHaveBeenCalledTimes(1);
    expect(service.vitals()).toEqual({
      heroId: 'hero-1',
      currentHealth: 84,
      maxHealth: 120,
      level: 4,
      currentExperience: 125,
      totalExperienceEarned: 2125,
      experienceToNextLevel: 500,
      remainingExperience: 375,
      experiencePercent: 25,
    });
    expect(service.currentHealth()).toBe(84);
    expect(service.maxHealth()).toBe(120);
  });

  it('resets when active hero is missing', () => {
    service.load();

    activeHeroState.set(null);
    service.load();

    expect(service.heroId()).toBeNull();
    expect(service.vitals()).toBeNull();
    expect(service.currentHealth()).toBe(0);
    expect(service.maxHealth()).toBe(0);
    expect(service.error()).toBeNull();
  });

  it('ignores stale responses after the active hero changes', () => {
    const firstHealthSubject = new Subject<HeroHealthStateReadModel>();
    const firstExperienceSubject = new Subject<HeroExperienceProgress>();
    const secondHealthSubject = new Subject<HeroHealthStateReadModel>();
    const secondExperienceSubject = new Subject<HeroExperienceProgress>();
    heroHealthState.getHeroHealthState.and.returnValues(
      firstHealthSubject,
      secondHealthSubject,
    );
    hero.getHeroExperienceProgress.and.returnValues(
      firstExperienceSubject,
      secondExperienceSubject,
    );

    service.load();
    activeHeroState.set(stateForHero('hero-2'));
    service.load();

    firstHealthSubject.next(healthState({ heroId: 'hero-1', currentHealth: 1 }));
    firstHealthSubject.complete();
    firstExperienceSubject.next(experienceProgress({ currentExperience: 1 }));
    firstExperienceSubject.complete();

    expect(service.heroId()).toBe('hero-2');
    expect(service.vitals()).toBeNull();
    expect(service.currentHealth()).toBe(0);
  });

  it('does not duplicate simultaneous vitals loads for the same hero', () => {
    const healthSubject = new Subject<HeroHealthStateReadModel>();
    const experienceSubject = new Subject<HeroExperienceProgress>();
    heroHealthState.getHeroHealthState.and.returnValue(healthSubject);
    hero.getHeroExperienceProgress.and.returnValue(experienceSubject);

    service.load();
    service.load();

    expect(heroHealthState.getHeroHealthState).toHaveBeenCalledTimes(1);
    expect(hero.getHeroExperienceProgress).toHaveBeenCalledTimes(1);
  });
});

function stateForHero(heroId: string): ActiveHeroState {
  return {
    userId: 'user-1',
    serverId: 'server-1',
    heroId,
    server: selectedServer(),
    hero: null,
    heroRow: null,
  };
}

function selectedServer(): SelectedGameServer {
  return {
    id: 'server-1',
    key: 'sandbox',
    name: 'Sandbox',
    kind: 'sandbox',
    status: 'live',
    description: null,
    launchedAt: null,
    archivedAt: null,
    membershipStatus: 'active',
    membership: null,
    staffRole: null,
    canManage: false,
    canUseAsSandbox: true,
  };
}

function healthState(
  overrides: Partial<HeroHealthStateReadModel> = {},
): HeroHealthStateReadModel {
  return {
    heroId: 'hero-1',
    serverId: 'server-1',
    currentHealth: 84,
    maxHealth: 120,
    resetPolicyKey: 'reset_to_max_on_runtime_sync',
    syncedAt: '2026-05-13T10:00:00.000Z',
    ...overrides,
  };
}

function experienceProgress(
  overrides: Partial<HeroExperienceProgress> = {},
): HeroExperienceProgress {
  return {
    level: 4,
    currentExperience: 125,
    totalExperienceEarned: 2125,
    experienceToNextLevel: 500,
    remainingExperience: 375,
    experiencePercent: 25,
    ...overrides,
  };
}
