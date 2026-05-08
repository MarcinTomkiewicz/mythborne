import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import {
  COMBAT_ATTACK_SOURCE_KIND,
  COMBAT_SIDE,
} from '../../domain/combat/combat.model';
import { CombatOpponentAdminData } from '../../domain/combat/combat-opponent.model';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { GeneratedItemResult, ItemGenerationCatalog } from '../../domain/item/item-generation.model';
import { ItemGenerationFactory } from '../../factories/item-generation/item-generation.factory';
import { FormulaService } from '../formula/formula';
import { ItemCatalogService } from '../items/item-catalog';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { CombatOpponentAdmin } from './combat-opponent-admin';
import { CombatOpponentResolver } from './combat-opponent-resolver';

describe('CombatOpponentResolver', () => {
  let opponents: jasmine.SpyObj<CombatOpponentAdmin>;
  let formulas: jasmine.SpyObj<FormulaService>;
  let itemCatalog: jasmine.SpyObj<ItemCatalogService>;
  let itemGeneration: jasmine.SpyObj<ItemGenerationFactory>;
  let service: CombatOpponentResolver;

  beforeEach(() => {
    opponents = jasmine.createSpyObj<CombatOpponentAdmin>('CombatOpponentAdmin', ['getAdminData']);
    formulas = jasmine.createSpyObj<FormulaService>('FormulaService', [
      'getAdminData',
      'getAssignedFormula',
    ]);
    itemCatalog = jasmine.createSpyObj<ItemCatalogService>('ItemCatalogService', ['getCatalog']);
    itemGeneration = jasmine.createSpyObj<ItemGenerationFactory>('ItemGenerationFactory', ['generate']);

    opponents.getAdminData.and.returnValue(of(adminData()));
    formulas.getAdminData.and.returnValue(of(formulaAdminData()));
    formulas.getAssignedFormula.and.returnValue(of({
      target: formulaTarget(),
      formula: formula('global-formula', 'global', 'round(baseValue * difficultyMultiplier)'),
      assignment: {
        id: 'assignment-1',
        targetId: 'target-1',
        formulaId: 'global-formula',
        createdAt: null,
        updatedAt: null,
      },
      source: 'global',
    }));
    itemCatalog.getCatalog.and.returnValue(of(itemCatalogData()));
    itemGeneration.generate.and.returnValue(generatedItem());

    TestBed.configureTestingModule({
      providers: [
        CombatOpponentResolver,
        FormulaRuntimeService,
        { provide: CombatOpponentAdmin, useValue: opponents },
        { provide: FormulaService, useValue: formulas },
        { provide: ItemCatalogService, useValue: itemCatalog },
        { provide: ItemGenerationFactory, useValue: itemGeneration },
      ],
    });
    service = TestBed.inject(CombatOpponentResolver);
  });

  it('resolves the same opponent with candidate-specific scaling formula and difficulty multiplier', async () => {
    const easy = await firstValueFrom(
      service.resolve({
        opponentDefinitionId: 'opponent-1',
        side: COMBAT_SIDE.defender,
        heroLevel: 5,
        difficultyMultiplier: 1,
        scalingFormulaId: 'candidate-formula',
      }),
    );
    const hard = await firstValueFrom(
      service.resolve({
        opponentDefinitionId: 'opponent-1',
        side: COMBAT_SIDE.defender,
        heroLevel: 5,
        difficultyMultiplier: 2,
        scalingFormulaId: 'candidate-formula',
      }),
    );

    expect(easy.participant.stats.maxHealth).toBe(15);
    expect(hard.participant.stats.maxHealth).toBe(25);
    expect(easy.participant.reference.opponentDefinitionId).toBe('opponent-1');
    expect(easy.participant.baseStats.find((entry) => entry.statKey === 'health')?.statValue).toBe(15);
    expect(hard.scalingFormula.formulaId).toBe('candidate-formula');
  });

  it('falls back from opponent default formula to global combat_opponent_scaled_stat assignment', async () => {
    opponents.getAdminData.and.returnValue(of(adminData({ defaultScalingFormulaId: null })));

    const resolved = await firstValueFrom(
      service.resolve({
        opponentDefinitionId: 'opponent-1',
        side: COMBAT_SIDE.defender,
        heroLevel: 5,
        difficultyMultiplier: 3,
      }),
    );

    expect(formulas.getAssignedFormula).toHaveBeenCalledWith('combat_opponent_scaled_stat');
    expect(resolved.participant.stats.maxHealth).toBe(30);
    expect(resolved.scalingFormula.formulaId).toBe('global-formula');
  });

  it('materializes generated opponent equipment once without creating player-owned items', async () => {
    opponents.getAdminData.and.returnValue(of(adminData({
      equipmentMode: 'generated',
      equipmentEntries: [{
        id: 'equipment-2',
        opponentDefinitionId: 'opponent-1',
        slotKey: 'main_hand',
        entryMode: 'generated',
        manualBaseId: null,
        manualQualityKey: null,
        manualPrefixAffixId: null,
        manualSuffixAffixId: null,
        generatedBucketProfileId: null,
        generatedMaxQualityKey: 'quality',
        minOpponentLevel: null,
        maxOpponentLevel: null,
        sortOrder: 10,
        isActive: true,
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
      }],
    })));

    const resolved = await firstValueFrom(
      service.resolve({
        opponentDefinitionId: 'opponent-1',
        side: COMBAT_SIDE.defender,
        heroLevel: 5,
        difficultyMultiplier: 1,
        scalingFormulaId: 'candidate-formula',
      }),
    );

    expect(itemCatalog.getCatalog).toHaveBeenCalledTimes(1);
    expect(itemGeneration.generate).toHaveBeenCalledTimes(1);
    expect(resolved.equipment[0].kind).toBe('generated');
    expect(resolved.equipment[0].source).toEqual(
      jasmine.objectContaining({
        kind: COMBAT_ATTACK_SOURCE_KIND.opponentGenerated,
        sourceItemId: null,
        sourceBaseId: 'base-1',
        sourceQualityKey: 'quality',
      }),
    );
    expect(resolved.participant.attackPlan.slots.some(
      (slot) => slot.source.kind === COMBAT_ATTACK_SOURCE_KIND.opponentGenerated,
    )).toBeTrue();
  });

  it('reports generated bucket profile as unsupported integration gap', async () => {
    opponents.getAdminData.and.returnValue(of(adminData({
      equipmentMode: 'generated',
      equipmentEntries: [equipmentEntry({
        id: 'equipment-2',
        entryMode: 'generated',
        generatedBucketProfileId: 'bucket-1',
        generatedMaxQualityKey: null,
        manualBaseId: null,
        manualQualityKey: null,
      })],
    })));

    await expectAsync(firstValueFrom(
      service.resolve({
        opponentDefinitionId: 'opponent-1',
        side: COMBAT_SIDE.defender,
        heroLevel: 5,
        difficultyMultiplier: 1,
        scalingFormulaId: 'candidate-formula',
      }),
    )).toBeRejectedWithError(
      'Generated opponent equipment entry "equipment-2" uses bucket profile "bucket-1", but opponent-specific bucket profile selection is not supported by the current item generation catalog loader.',
    );
  });

  it('uses item generation catalog labels for manual opponent equipment source label', async () => {
    const resolved = await firstValueFrom(
      service.resolve({
        opponentDefinitionId: 'opponent-1',
        side: COMBAT_SIDE.defender,
        heroLevel: 5,
        difficultyMultiplier: 1,
        scalingFormulaId: 'candidate-formula',
      }),
    );

    expect(resolved.equipment[0].source.label).toBe('Normal Blade');
  });

  it('reports opponent without active attacks or equipment as configuration gap', async () => {
    opponents.getAdminData.and.returnValue(of(adminData({
      equipmentMode: 'none',
      attackSources: [],
      equipmentEntries: [],
    })));

    await expectAsync(firstValueFrom(
      service.resolve({
        opponentDefinitionId: 'opponent-1',
        side: COMBAT_SIDE.defender,
        heroLevel: 5,
        difficultyMultiplier: 1,
        scalingFormulaId: 'candidate-formula',
      }),
    )).toBeRejectedWithError(
      'Combat opponent "bandit" has no active natural attacks or materialized equipment attack sources.',
    );
  });

  it('reports missing opponent content as configuration gap', async () => {
    opponents.getAdminData.and.returnValue(of({
      ...adminData(),
      opponents: [],
      emptyState: {
        kind: 'empty_opponent_catalog',
        message: 'No combat opponent families or definitions are configured yet.',
      },
    }));

    await expectAsync(firstValueFrom(
      service.resolve({
        opponentDefinitionId: 'missing-opponent',
        side: COMBAT_SIDE.defender,
        heroLevel: 5,
        difficultyMultiplier: 1,
      }),
    )).toBeRejectedWithError('Missing combat opponent definition "missing-opponent".');
  });
});

function adminData(overrides: {
  defaultScalingFormulaId?: string | null;
  equipmentMode?: string;
  equipmentEntries?: CombatOpponentAdminData['equipmentEntries'];
  attackSources?: CombatOpponentAdminData['attackSources'];
} = {}): CombatOpponentAdminData {
  const equipmentMode = overrides.equipmentMode ?? 'manual';

  return {
    families: [{
      key: 'bandits',
      label: 'Bandits',
      description: null,
      helperText: null,
      adminDescription: null,
      sortOrder: 10,
      isActive: true,
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    }],
    opponents: [{
      id: 'opponent-1',
      key: 'bandit',
      label: 'Bandit',
      description: null,
      helperText: null,
      adminDescription: null,
      familyKey: 'bandits',
      equipmentMode,
      defaultScalingFormulaId: Object.hasOwn(overrides, 'defaultScalingFormulaId')
        ? overrides.defaultScalingFormulaId ?? null
        : 'default-formula',
      sortOrder: 10,
      isActive: true,
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    }],
    statValues: [
      statValue('health', 10),
      statValue('defense', 2),
      statValue('critical_damage', 150),
    ],
    attackSources: overrides.attackSources ?? [{
      id: 'attack-1',
      opponentDefinitionId: 'opponent-1',
      key: 'bite',
      label: 'Bite',
      description: null,
      helperText: null,
      adminDescription: null,
      minDamage: 2,
      maxDamage: 4,
      criticalChance: 5,
      criticalDamage: 150,
      attackCount: 2,
      minOpponentLevel: null,
      maxOpponentLevel: null,
      sortOrder: 10,
      isActive: true,
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    }],
    equipmentEntries: overrides.equipmentEntries ?? [equipmentEntry()],
    equipmentModes: [],
    equipmentSlots: [],
    stats: [],
    dictionaries: {
      sourceTypes: [],
      sides: [],
      outcomes: [],
      participantKinds: [],
      attackSourceKinds: [],
      candidateKinds: [],
    },
    opponentViews: [],
    emptyState: null,
  };
}

function equipmentEntry(
  overrides: Partial<CombatOpponentAdminData['equipmentEntries'][number]> = {},
): CombatOpponentAdminData['equipmentEntries'][number] {
  return {
    id: 'equipment-1',
    opponentDefinitionId: 'opponent-1',
    slotKey: 'main_hand',
    entryMode: 'manual',
    manualBaseId: 'base-1',
    manualQualityKey: 'normal',
    manualPrefixAffixId: null,
    manualSuffixAffixId: null,
    generatedBucketProfileId: null,
    generatedMaxQualityKey: null,
    minOpponentLevel: null,
    maxOpponentLevel: null,
    sortOrder: 10,
    isActive: true,
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
    ...overrides,
  };
}

function statValue(statKey: string, baseValue: number): CombatOpponentAdminData['statValues'][number] {
  return {
    id: `stat-${statKey}`,
    opponentDefinitionId: 'opponent-1',
    statKey,
    baseValue,
    sortOrder: 10,
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };
}

function formulaAdminData(): FormulaAdminData {
  return {
    targets: [formulaTarget()],
    formulas: [
      formula('candidate-formula', 'Candidate scaling', 'round(baseValue * difficultyMultiplier + currentLevel)'),
      formula('default-formula', 'Default scaling', 'round(baseValue + currentLevel)'),
    ],
    assignments: [],
    entityAssignments: [],
    blocks: [],
  };
}

function formulaTarget() {
  return {
    id: 'target-1',
    key: 'combat_opponent_scaled_stat',
    scopeKey: 'combat',
    label: 'Opponent scaled stat',
    description: null,
    allowedVariables: [
      'baseValue',
      'currentLevel',
      'difficultyMultiplier',
    ],
    defaultTestContext: {},
    sortOrder: 10,
    createdAt: null,
  };
}

function formula(id: string, label: string, expression: string) {
  return {
    id,
    key: id,
    scopeKey: 'combat',
    label,
    expression,
    description: null,
    isEnabled: true,
    createdAt: null,
    updatedAt: null,
  };
}

function itemCatalogData(): ItemGenerationCatalog {
  return {
    budgetBuckets: [10],
    qualities: [
      { key: 'normal', label: 'Normal', multiplier: 1, requirementMultiplier: 1, weight: 1 },
      { key: 'quality', label: 'Quality', multiplier: 1.5, requirementMultiplier: 1.25, weight: 1 },
      { key: 'outstanding', label: 'Outstanding', multiplier: 2, requirementMultiplier: 1.5, weight: 1 },
    ],
    baseTypes: [],
    baseTypeTargets: [],
    bases: [{
      id: 'base-1',
      key: 'blade',
      name: 'Blade',
      baseTypeKey: 'weapon',
      baseTypeLabel: 'Weapon',
      equipmentSlotGroup: 'main_hand',
      handUsage: 'one_handed',
      baseValue: 5,
      description: '',
      bonuses: [],
    }],
    prefixes: [],
    suffixes: [],
  };
}

function generatedItem(): GeneratedItemResult {
  return {
    displayName: 'Generated blade',
    bucketValue: 10,
    luck: 5,
    quality: {
      key: 'quality',
      label: 'Quality',
      multiplier: 1.5,
      requirementMultiplier: 1.25,
      weight: 1,
    },
    base: {
      id: 'base-1',
      key: 'blade',
      name: 'Blade',
      baseTypeKey: 'weapon',
      baseTypeLabel: 'Weapon',
      equipmentSlotGroup: 'main_hand',
      handUsage: 'one_handed',
      baseValue: 5,
      description: '',
      bonuses: [],
    },
    prefix: null,
    suffix: null,
    baseBudget: 10,
    preQualityValue: 5,
    finalValue: 8,
    remainingBudget: 5,
    combinedBonuses: [],
    parts: [],
    process: [],
  };
}
