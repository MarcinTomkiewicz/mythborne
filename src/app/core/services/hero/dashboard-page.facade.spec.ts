import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Hero } from './hero';
import { Origins } from '../origins/origins';
import { StatsService } from '../stats/stats';
import { DashboardPageFacade } from './dashboard-page.facade';
import { CharacterPointHistory } from './character-point-history';
import { HeroDashboardRuntimeStats } from './hero-dashboard-runtime-stats';
import { ActiveServer } from '../server/active-server';
import { SelectedGameServer } from '../../interfaces/server/active-server.interface';
import { ActiveHeroVitalsState } from './active-hero-vitals-state';

describe('DashboardPageFacade', () => {
  let facade: DashboardPageFacade;
  let hero: jasmine.SpyObj<Hero>;
  let runtimeStats: jasmine.SpyObj<HeroDashboardRuntimeStats>;
  let selectedServer: ReturnType<typeof signal<SelectedGameServer | null>>;
  let vitalsLoad: jasmine.Spy;
  let vitalsLevel: ReturnType<typeof signal<number | null>>;
  let vitalsCurrentHealth: ReturnType<typeof signal<number>>;
  let vitalsMaxHealth: ReturnType<typeof signal<number>>;
  let vitalsCurrentExperience: ReturnType<typeof signal<number>>;
  let vitalsTotalExperienceEarned: ReturnType<typeof signal<number>>;
  let vitalsExperienceToNextLevel: ReturnType<typeof signal<number | null>>;
  let vitalsRemainingExperience: ReturnType<typeof signal<number | null>>;
  let vitalsExperiencePercent: ReturnType<typeof signal<number>>;
  let vitalsIsLoading: ReturnType<typeof signal<boolean>>;
  let vitalsError: ReturnType<typeof signal<string | null>>;

  beforeEach(() => {
    hero = jasmine.createSpyObj<Hero>('Hero', [
      'getHeroData',
      'getHeroStats',
      'getHeroEstateAddress',
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
    hero.getHeroEstateAddress.and.returnValue(of('A-3'));
    vitalsLoad = jasmine.createSpy('load');
    vitalsLevel = signal<number | null>(4);
    vitalsCurrentHealth = signal(84);
    vitalsMaxHealth = signal(120);
    vitalsCurrentExperience = signal(125);
    vitalsTotalExperienceEarned = signal(2125);
    vitalsExperienceToNextLevel = signal<number | null>(500);
    vitalsRemainingExperience = signal<number | null>(375);
    vitalsExperiencePercent = signal(25);
    vitalsIsLoading = signal(false);
    vitalsError = signal<string | null>(null);
    selectedServer = signal<SelectedGameServer | null>({
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
    });

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
        currentHealth: 84,
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
          provide: ActiveHeroVitalsState,
          useValue: {
            load: vitalsLoad,
            level: vitalsLevel.asReadonly(),
            currentHealth: vitalsCurrentHealth.asReadonly(),
            maxHealth: vitalsMaxHealth.asReadonly(),
            currentExperience: vitalsCurrentExperience.asReadonly(),
            totalExperienceEarned: vitalsTotalExperienceEarned.asReadonly(),
            experienceToNextLevel: vitalsExperienceToNextLevel.asReadonly(),
            remainingExperience: vitalsRemainingExperience.asReadonly(),
            experiencePercent: vitalsExperiencePercent.asReadonly(),
            isLoading: vitalsIsLoading.asReadonly(),
            error: vitalsError.asReadonly(),
          },
        },
        {
          provide: Origins,
          useValue: jasmine.createSpyObj<Origins>('Origins', ['getOriginWithBonuses']),
        },
        {
          provide: StatsService,
          useValue: jasmine.createSpyObj<StatsService>('StatsService', {
            getStats: of([
              {
                id: 'stat-strength',
                key: 'strength',
                label: 'Strength',
                order: 1,
                description: null,
              },
              {
                id: 'stat-dexterity',
                key: 'dexterity',
                label: 'Dexterity',
                order: 2,
                description: null,
              },
              {
                id: 'stat-vitality',
                key: 'vitality',
                label: 'Vitality',
                order: 3,
                description: null,
              },
            ]),
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
        {
          provide: ActiveServer,
          useValue: { selectedServer: selectedServer.asReadonly() },
        },
      ],
    });
    facade = TestBed.inject(DashboardPageFacade);
  });

  it('displays XP progress from the canonical threshold read model', () => {
    facade.loadData();

    expect(vitalsLoad).toHaveBeenCalled();
    expect(facade.level()).toBe(4);
    expect(facade.experience()).toBe(125);
    expect(facade.experienceToNextLevel()).toBe(500);
    expect(facade.remainingExperience()).toBe(375);
    expect(facade.totalExperienceEarned()).toBe(2125);
    expect(facade.experiencePercent()).toBe(25);
    expect(facade.experienceError()).toBeNull();
    expect(facade.characterPoints()).toBe(9);
    expect(facade.totalCharacterPointsEarned()).toBe(42);
    expect(facade.estateAddress()).toBe('A-3');
    expect(facade.selectedServer()?.name).toBe('Sandbox');
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
    expect(facade.healthDisplay()).toEqual({
      currentHealth: 84,
      maxHealth: 120,
    });
  });

  it('uses DB-provided runtime stats_json for Hero Stats display', () => {
    facade.loadData();

    expect(facade.statsDisplay()).toEqual({
      strength: 19,
      dexterity: 6,
    });
    expect(facade.baseStatRows()).toEqual([
      { key: 'strength', label: 'Strength', value: 19 },
      { key: 'dexterity', label: 'Dexterity', value: 6 },
    ]);
    expect(hero.getHeroStats).not.toHaveBeenCalled();
  });

  it('surfaces XP threshold errors instead of using a hardcoded display threshold', () => {
    vitalsExperienceToNextLevel.set(null);
    vitalsRemainingExperience.set(null);
    vitalsExperiencePercent.set(0);
    vitalsError.set('Formula target "Hero experience to next level" failed.');

    facade.loadData();

    expect(facade.experienceToNextLevel()).toBeNull();
    expect(facade.remainingExperience()).toBeNull();
    expect(facade.experiencePercent()).toBe(0);
    expect(facade.experienceError()).toBe(
      'Formula target "Hero experience to next level" failed.',
    );
  });
});
