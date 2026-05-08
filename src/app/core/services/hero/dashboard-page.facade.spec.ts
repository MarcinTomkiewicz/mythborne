import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Hero } from './hero';
import { Origins } from '../origins/origins';
import { StatsService } from '../stats/stats';
import { DashboardPageFacade } from './dashboard-page.facade';
import { CharacterPointHistory } from './character-point-history';
import { HeroDashboardRuntimeStats } from './hero-dashboard-runtime-stats';

describe('DashboardPageFacade', () => {
  let facade: DashboardPageFacade;
  let hero: jasmine.SpyObj<Hero>;
  let runtimeStats: jasmine.SpyObj<HeroDashboardRuntimeStats>;

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
        total_character_points_earned: 42,
        origin_id: null,
      }) as ReturnType<Hero['getHeroData']>,
    );
    hero.getHeroStats.and.throwError('Dashboard must use runtime stats_json.');
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

    runtimeStats = jasmine.createSpyObj<HeroDashboardRuntimeStats>('HeroDashboardRuntimeStats', {
      getActiveHeroRuntimeStats: of({
        heroId: 'hero-1',
        damageRows: [
          { key: 'main_hand', label: 'Demonic Dagger', displayValue: '21-28' },
          { key: 'off_hand', label: 'Unarmed', displayValue: '20-21' },
        ],
        stats: {
          strength: 19,
          dexterity: 6,
        },
        defense: 104,
        maxHealth: 120,
        luck: 3,
        criticalChanceBonus: 2,
        criticalDamage: 50,
        evasionChanceBonus: 8,
        attackCount: 2,
        attackPlanJson: {},
        sourceJson: {},
        statsJson: {},
      }),
    });

    TestBed.configureTestingModule({
      providers: [
        DashboardPageFacade,
        { provide: Hero, useValue: hero },
        { provide: HeroDashboardRuntimeStats, useValue: runtimeStats },
        {
          provide: Origins,
          useValue: jasmine.createSpyObj<Origins>('Origins', ['getOriginWithBonuses']),
        },
        {
          provide: StatsService,
          useValue: jasmine.createSpyObj<StatsService>('StatsService', {
            getStats: of([]),
          }),
        },
        {
          provide: CharacterPointHistory,
          useValue: jasmine.createSpyObj<CharacterPointHistory>('CharacterPointHistory', {
            getActiveHeroHistory: of([
              {
                id: 'cp-ledger-1',
                heroId: 'hero-1',
                serverId: 'server-1',
                reason: 'experience_gain',
                entryType: 'xp_gain',
                reasonLabel: 'XP-derived Character Points',
                amountDelta: 25,
                amountLabel: '+25 Character Points',
                balanceAfter: 42,
                createdAt: '2026-05-03T10:00:00.000Z',
              },
            ]),
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
    expect(facade.characterPoints()).toBe(9);
    expect(facade.totalCharacterPointsEarned()).toBe(42);
  });

  it('loads recent Character Points history without calculating current balance from it', () => {
    facade.loadData();

    expect(facade.characterPoints()).toBe(9);
    expect(facade.characterPointHistoryEntries()).toEqual([
      jasmine.objectContaining({
        reasonLabel: 'XP-derived Character Points',
        amountLabel: '+25 Character Points',
        balanceAfter: 42,
      }),
    ]);
  });

  it('exposes DB-owned runtime combat stat rows for dashboard rendering', () => {
    facade.loadData();

    expect(runtimeStats.getActiveHeroRuntimeStats).toHaveBeenCalled();
    expect(facade.derivedStatRows()).toEqual([
      {
        key: 'damage',
        label: 'Damage',
        value: '',
        damageRows: [
          { key: 'main_hand', label: 'Demonic Dagger', displayValue: '21-28' },
          { key: 'off_hand', label: 'Unarmed', displayValue: '20-21' },
        ],
      },
      { key: 'defense', label: 'Defense', value: 104, damageRows: [] },
      { key: 'luck', label: 'Luck', value: 3, damageRows: [] },
      { key: 'critical_chance', label: 'Critical chance', value: '2%', damageRows: [] },
      { key: 'critical_damage', label: 'Critical damage', value: '50%', damageRows: [] },
      { key: 'evasion', label: 'Evasion', value: '8%', damageRows: [] },
      { key: 'attack_count', label: 'Attack count', value: 2, damageRows: [] },
    ]);
    expect(facade.derivedDisplay().health).toBe(120);
  });

  it('uses DB-provided runtime stats_json for Hero Stats display', () => {
    facade.loadData();

    expect(facade.statsDisplay()).toEqual({
      strength: 19,
      dexterity: 6,
    });
    expect(hero.getHeroStats).not.toHaveBeenCalled();
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
