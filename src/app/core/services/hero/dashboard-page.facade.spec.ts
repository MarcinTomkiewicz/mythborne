import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';
import { IHeroDerived } from '../../types/hero.types';
import { Hero } from './hero';
import { HeroDerivedStats } from './hero-derived-stats';
import { Origins } from '../origins/origins';
import { StatsService } from '../stats/stats';
import { DashboardPageFacade } from './dashboard-page.facade';

describe('DashboardPageFacade', () => {
  let facade: DashboardPageFacade;
  let hero: jasmine.SpyObj<Hero>;

  beforeEach(() => {
    hero = jasmine.createSpyObj<Hero>('Hero', [
      'getHeroData',
      'getHeroStats',
      'getHeroExperienceProgress',
    ]);
    hero.getHeroData.and.returnValue(
      of({
        id: 'hero-1',
        name: 'Ariadne',
        level: 4,
        experience: 125,
        total_experience_earned: 2125,
        character_points: 9,
        origin_id: null,
      }) as ReturnType<Hero['getHeroData']>,
    );
    hero.getHeroStats.and.returnValue(of({ strength: 1 } as IHeroStats));
    hero.getHeroExperienceProgress.and.returnValue(
      of({
        level: 4,
        currentExperience: 125,
        totalExperienceEarned: 2125,
        experienceToNextLevel: 500,
        remainingExperience: 375,
        experiencePercent: 25,
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        DashboardPageFacade,
        { provide: Hero, useValue: hero },
        {
          provide: HeroDerivedStats,
          useValue: jasmine.createSpyObj<HeroDerivedStats>('HeroDerivedStats', {
            resolveActiveHeroDerivedStats: of({
              health: 10,
              def: 4,
              minDmg: 2,
              maxDmg: 7,
              luck: 3,
              critical: 12,
              criticalDamage: 50,
              evasion: 8,
            } as IHeroDerived),
          }),
        },
        {
          provide: Origins,
          useValue: jasmine.createSpyObj<Origins>('Origins', ['getOriginWithBonuses']),
        },
        {
          provide: StatsService,
          useValue: jasmine.createSpyObj<StatsService>('StatsService', {
            getStats: of([]),
            getDerivedStats: of([]),
            getFinalStats: { strength: 1 },
          }),
        },
      ],
    });
    facade = TestBed.inject(DashboardPageFacade);
  });

  it('displays XP progress from the canonical threshold read model', () => {
    facade.loadData();

    expect(hero.getHeroExperienceProgress).toHaveBeenCalled();
    expect(facade.level()).toBe(4);
    expect(facade.experience()).toBe(125);
    expect(facade.experienceToNextLevel()).toBe(500);
    expect(facade.remainingExperience()).toBe(375);
    expect(facade.totalExperienceEarned()).toBe(2125);
    expect(facade.experiencePercent()).toBe(25);
    expect(facade.experienceError()).toBeNull();
  });

  it('exposes ordered derived stat rows for dashboard rendering', () => {
    facade.loadData();

    expect(facade.derivedStatRows()).toEqual([
      { key: 'defense', label: 'DEF', value: 4 },
      { key: 'damage', label: 'DMG', value: '2 - 7' },
      { key: 'luck', label: 'Luck', value: 3 },
      { key: 'critical_chance', label: 'Critical chance', value: 12 },
      { key: 'critical_damage', label: 'Critical damage', value: 50 },
      { key: 'evasion', label: 'Evasion', value: 8 },
    ]);
  });

  it('surfaces XP threshold errors instead of using a hardcoded display threshold', () => {
    hero.getHeroExperienceProgress.and.returnValue(
      throwError(() => new Error('Formula target "Hero experience to next level" failed.')),
    );

    facade.loadData();

    expect(facade.experienceToNextLevel()).toBeNull();
    expect(facade.remainingExperience()).toBeNull();
    expect(facade.experiencePercent()).toBe(0);
    expect(facade.experienceError()).toBe(
      'Formula target "Hero experience to next level" failed.',
    );
  });
});
