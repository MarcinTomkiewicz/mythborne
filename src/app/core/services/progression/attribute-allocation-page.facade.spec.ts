import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IHeroStats } from '../../interfaces/hero/i-hero-stats';
import { IStat } from '../../interfaces/i-stats/i-stats';
import { StatProgressionRules } from '../../domain/progression/stat-progression.model';
import { Hero } from '../hero/hero';
import { StatsService } from '../stats/stats';
import { ToastService } from '../ui/toast';
import { AttributeAllocationPageFacade } from './attribute-allocation-page.facade';
import { StatProgressionService } from './stat-progression';

describe('AttributeAllocationPageFacade', () => {
  let facade: AttributeAllocationPageFacade;
  let statProgression: jasmine.SpyObj<StatProgressionService>;
  let hero: jasmine.SpyObj<Hero>;

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
      'evaluateNextLevelCost',
      'getNextLevelCost',
      'getRules',
    ]);
    statProgression.evaluateStatCap.and.returnValue({ value: 10, error: null });
    statProgression.evaluateNextLevelCost.and.returnValue({ value: 3, error: null });
    statProgression.getNextLevelCost.and.returnValue(3);
    statProgression.getRules.and.returnValue(of(rules()));

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
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj<ToastService>('ToastService', ['show']),
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
    statProgression.evaluateNextLevelCost.and.returnValue({
      value: null,
      error: 'Formula target "Hero stat upgrade cost" has no enabled assigned formula.',
    });
    statProgression.getNextLevelCost.and.returnValue(null);

    const row = facade.statRows()[0];

    expect(facade.spentCharacterPoints()).toBeNull();
    expect(facade.remainingCharacterPoints()).toBeNull();
    expect(facade.characterPointSummaryError()).toContain('Stat upgrade cost cannot be calculated');
    expect(row.nextLevelCost).toBeNull();
    expect(row.canIncrease).toBeFalse();
    expect(row.formulaError).toBe(
      'Formula target "Hero stat upgrade cost" has no enabled assigned formula.',
    );
    expect(row.increaseReason).toBe(
      'Formula target "Hero stat upgrade cost" has no enabled assigned formula.',
    );
  });

  it('does not save when stat upgrade cost configuration is unavailable', () => {
    statProgression.evaluateNextLevelCost.and.returnValue({
      value: null,
      error: 'Formula target "Hero stat upgrade cost" has no enabled assigned formula.',
    });
    statProgression.getNextLevelCost.and.returnValue(null);

    facade.saveDraft();

    expect(hero.saveProgressionDraft).not.toHaveBeenCalled();
  });

  function seedFacade(): void {
    facade.heroLevel.set(2);
    facade.characterPoints.set(10);
    facade.statsList.set([stat()]);
    facade.baseStats.set({ strength: 1 });
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
      allowedVariables: ['heroLevel', 'level', 'statLevel'],
      defaultTestContext: { heroLevel: 1, level: 1, statLevel: 1 },
      sortOrder: 1,
      createdAt: null,
    },
    capTarget: {
      id: 'target-cap',
      key: 'hero_stat_level_cap',
      scopeKey: 'hero_progression',
      label: 'Hero stat level cap',
      description: null,
      allowedVariables: ['heroLevel'],
      defaultTestContext: { heroLevel: 1 },
      sortOrder: 2,
      createdAt: null,
    },
    costFormula: {
      id: 'formula-cost',
      key: 'stat-upgrade-cost',
      scopeKey: 'hero_progression',
      label: 'Stat upgrade cost',
      expression: 'heroLevel + level + statLevel',
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
      expression: 'heroLevel + 8',
      description: null,
      isEnabled: true,
      createdAt: null,
      updatedAt: null,
    },
  };
}
