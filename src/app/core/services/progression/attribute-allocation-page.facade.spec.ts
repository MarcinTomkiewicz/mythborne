import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';
import { IStat } from '../../interfaces/i-stats/i-stats';
import { StatProgressionRules } from '../../domain/progression/stat-progression.model';
import { Hero } from '../hero/hero';
import { HeroDashboardRuntimeStats } from '../hero/hero-dashboard-runtime-stats';
import { StatsService } from '../stats/stats';
import { ToastService } from '../ui/toast';
import { AttributeAllocationPageFacade } from './attribute-allocation-page.facade';
import { StatProgressionService } from './stat-progression';

describe('AttributeAllocationPageFacade', () => {
  let facade: AttributeAllocationPageFacade;
  let statProgression: jasmine.SpyObj<StatProgressionService>;
  let hero: jasmine.SpyObj<Hero>;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    hero = jasmine.createSpyObj<Hero>('Hero', [
      'getHeroData',
      'getHeroStats',
      'saveProgressionDraft',
    ]);
    hero.getHeroData.and.returnValue(
      of({ level: 1, character_points: 10 }) as unknown as ReturnType<Hero['getHeroData']>,
    );
    hero.getHeroStats.and.returnValue(of({ strength: 1 } as IHeroStats));
    hero.saveProgressionDraft.and.returnValue(
      of({
        auditLogId: 'audit-1',
        characterPointsAfter: 7,
        heroId: 'hero-1',
        serverId: 'server-1',
        stats: { strength: 2 },
      }),
    );

    statProgression = jasmine.createSpyObj<StatProgressionService>('StatProgressionService', [
      'evaluateStatCap',
      'getNextLevelCost',
      'getRules',
    ]);
    statProgression.evaluateStatCap.and.returnValue({ value: 10, error: null });
    statProgression.getNextLevelCost.and.returnValue(3);
    statProgression.getRules.and.returnValue(of(rules()));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['show']);

    TestBed.configureTestingModule({
      providers: [
        AttributeAllocationPageFacade,
        { provide: Hero, useValue: hero },
        {
          provide: StatsService,
          useValue: jasmine.createSpyObj<StatsService>('StatsService', {
            getStats: of([stat()]),
          }),
        },
        { provide: StatProgressionService, useValue: statProgression },
        { provide: ToastService, useValue: toast },
        {
          provide: HeroDashboardRuntimeStats,
          useValue: jasmine.createSpyObj<HeroDashboardRuntimeStats>(
            'HeroDashboardRuntimeStats',
            {
              getActiveHeroRuntimeStats: of(null) as unknown as ReturnType<
                HeroDashboardRuntimeStats['getActiveHeroRuntimeStats']
              >,
            },
          ),
        },
      ],
    });
    facade = TestBed.inject(AttributeAllocationPageFacade);
    seedFacade();
  });

  it('keeps calculated Character Points visible when stat upgrade cost is available', () => {
    expect(facade.spentCharacterPoints()).toBe(3);
    expect(facade.remainingCharacterPoints()).toBe(7);
    expect(facade.characterPointSummaryError()).toBeNull();
    expect(facade.statRows()[0].canIncrease).toBeTrue();
  });

  it('surfaces broken stat upgrade cost configuration instead of reporting zero spent points', () => {
    statProgression.getNextLevelCost.and.returnValue(null);

    const row = facade.statRows()[0];

    expect(facade.spentCharacterPoints()).toBeNull();
    expect(facade.remainingCharacterPoints()).toBeNull();
    expect(facade.characterPointSummaryError()).toContain('Stat upgrade cost cannot be calculated');
    expect(row.nextLevelCost).toBeNull();
    expect(row.canIncrease).toBeFalse();

    facade.saveDraft();

    expect(hero.saveProgressionDraft).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Formula error',
      'Stat upgrade cost cannot be calculated because the active formula configuration is broken.',
    );
  });

  it('shows a player-facing error when the draft costs more Character Points than available', () => {
    facade.characterPoints.set(1);

    facade.saveDraft();

    expect(facade.remainingCharacterPoints()).toBe(-2);
    expect(hero.saveProgressionDraft).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Not enough Character Points',
      'Lower the draft allocation before saving.',
    );
  });

  it('blocks save when the stat cap formula cannot be evaluated', () => {
    statProgression.evaluateStatCap.and.returnValue({
      value: null,
      error: 'Formula target "Hero stat level cap" has no enabled assigned formula.',
    });

    facade.saveDraft();

    expect(facade.statCapSummaryError()).toBe(
      'Formula target "Hero stat level cap" has no enabled assigned formula.',
    );
    expect(facade.statRows()[0].canIncrease).toBeFalse();
    expect(hero.saveProgressionDraft).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Formula error',
      'Formula target "Hero stat level cap" has no enabled assigned formula.',
    );
  });

  it('blocks save when a planned stat is above the formula-driven cap', () => {
    statProgression.evaluateStatCap.and.returnValue({ value: 2, error: null });
    facade.draftStats.set({ strength: 3 });

    facade.saveDraft();

    expect(facade.statRows()[0].canIncrease).toBeFalse();
    expect(facade.canSaveDraft()).toBeFalse();
    expect(hero.saveProgressionDraft).not.toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Stat cap exceeded',
      'One or more planned stats are above the current formula-driven cap.',
    );
  });

  function seedFacade(): void {
    facade.loadData();
    facade.heroLevel.set(2);
    facade.characterPoints.set(10);
    facade.draftStats.set({ strength: 2 });
    facade.progressionRules.set(rules());
  }
});

function stat(): IStat {
  return {
    id: 'stat-strength',
    key: 'strength',
    label: 'Strength',
    order: 1,
    description: null,
  };
}

function rules(): StatProgressionRules {
  return {
    costTarget: {
      id: 'target-cost',
      key: 'hero_stat_upgrade_cost',
      scopeKey: 'hero_progression',
      label: 'Hero stat upgrade cost',
      description: null,
      allowedVariables: ['statCurrentLevel'],
      defaultTestContext: { statCurrentLevel: 1 },
      sortOrder: 1,
      createdAt: null,
    },
    capTarget: {
      id: 'target-cap',
      key: 'hero_stat_level_cap',
      scopeKey: 'hero_progression',
      label: 'Hero stat level cap',
      description: null,
      allowedVariables: ['currentLevel'],
      defaultTestContext: { currentLevel: 1 },
      sortOrder: 2,
      createdAt: null,
    },
    costFormula: {
      id: 'formula-cost',
      key: 'stat-upgrade-cost',
      scopeKey: 'hero_progression',
      label: 'Stat upgrade cost',
      expression: 'statCurrentLevel',
      description: null,
      isEnabled: true,
      createdAt: null,
      updatedAt: null,
    },
    capFormula: {
      id: 'formula-cap',
      key: 'stat-level-cap',
      scopeKey: 'hero_progression',
      label: 'Stat level cap',
      expression: 'currentLevel + 8',
      description: null,
      isEnabled: true,
      createdAt: null,
      updatedAt: null,
    },
  };
}
