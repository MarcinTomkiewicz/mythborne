import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { RPC } from '../../constants/rpc.const';
import { COMBAT_SIDE } from '../../domain/combat/combat.model';
import { CombatOpponentAdminData } from '../../domain/combat/combat-opponent.model';
import { FormulaAdminData } from '../../domain/formula/formula.model';
import { ItemGenerationCatalog } from '../../domain/item/item-generation.model';
import { Backend } from '../backend/backend';
import { FormulaService } from '../formula/formula';
import { ItemCatalogService } from '../items/item-catalog';
import { FormulaRuntimeService } from '../progression/formula-runtime';
import { CombatOpponentAdmin } from './combat-opponent-admin';
import { CombatOpponentResolver } from './combat-opponent-resolver';

describe('CombatOpponentResolver', () => {
  let opponents: jasmine.SpyObj<CombatOpponentAdmin>;
  let formulas: jasmine.SpyObj<FormulaService>;
  let itemCatalog: jasmine.SpyObj<ItemCatalogService>;
  let backend: jasmine.SpyObj<Backend>;
  let service: CombatOpponentResolver;

  beforeEach(() => {
    opponents = jasmine.createSpyObj<CombatOpponentAdmin>('CombatOpponentAdmin', ['getAdminData']);
    formulas = jasmine.createSpyObj<FormulaService>('FormulaService', [
      'getAdminData',
      'getAssignedFormula',
    ]);
    itemCatalog = jasmine.createSpyObj<ItemCatalogService>('ItemCatalogService', ['getCatalog']);
    backend = jasmine.createSpyObj<Backend>('Backend', ['rpc']);

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
    backend.rpc.and.returnValue(of(opponentCombatantSnapshot()));

    TestBed.configureTestingModule({
      providers: [
        CombatOpponentResolver,
        FormulaRuntimeService,
        { provide: CombatOpponentAdmin, useValue: opponents },
        { provide: FormulaService, useValue: formulas },
        { provide: ItemCatalogService, useValue: itemCatalog },
        { provide: Backend, useValue: backend },
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

  it('uses DB-owned combatant snapshot for generated opponent equipment', async () => {
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

    expect(backend.rpc).toHaveBeenCalledOnceWith(
      RPC.build_opponent_combatant_snapshot_for_resolver,
      {
        p_opponent_definition_id: 'opponent-1',
        p_side: COMBAT_SIDE.defender,
        p_reference_level: 5,
        p_difficulty_multiplier: 1,
        p_candidate_scaling_formula_id: 'candidate-formula',
      },
    );
    expect(resolved.participant.attackPlan.slots[0].source).toEqual(jasmine.objectContaining({
      kind: 'opponent_generated',
      label: 'Generated Raider Blade',
      sourceBaseId: 'base-generated',
      sourceQualityKey: 'quality',
    }));
    expect(resolved.equipment[0].generatedItem).toEqual(jasmine.objectContaining({
      displayName: 'Generated Raider Blade',
      baseId: 'base-generated',
      qualityKey: 'quality',
    }));
    expect(itemCatalog.getCatalog).not.toHaveBeenCalled();
  });

  it('passes generated bucket profile entries through the DB-owned snapshot path', async () => {
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

    const resolved = await firstValueFrom(
      service.resolve({
        opponentDefinitionId: 'opponent-1',
        side: COMBAT_SIDE.defender,
        heroLevel: 5,
        difficultyMultiplier: 1,
        scalingFormulaId: 'candidate-formula',
      }),
    );

    expect(backend.rpc).toHaveBeenCalledWith(
      RPC.build_opponent_combatant_snapshot_for_resolver,
      jasmine.objectContaining({
        p_opponent_definition_id: 'opponent-1',
      }),
    );
    expect(resolved.participant.attackPlan.slots[0].source.kind).toBe('opponent_generated');
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

function opponentCombatantSnapshot() {
  return {
    side: 'defender',
    displayName: 'Bandit',
    level: 5,
    reference: {
      participantKind: 'opponent',
      heroId: null,
      opponentDefinitionId: 'opponent-1',
    },
    stats: {
      maxHealth: 15,
      defense: 7,
      minDamage: 2,
      maxDamage: 4,
      luck: 0,
      criticalChance: 5,
      criticalDamage: 150,
      evasionChance: 0,
    },
    baseStats: [
      { side: 'defender', statKey: 'health', statValue: 15 },
    ],
    formulaBonuses: {
      hitBonusFromItems: 0,
      critBonusFromItems: 0,
      evasionBonusFromItems: 0,
      damageBonusFromItems: 0,
    },
    attackPlan: {
      side: 'defender',
      slots: [{
        side: 'defender',
        slotIndex: 0,
        initiativeScore: 0,
        source: {
          kind: 'opponent_generated',
          label: 'Generated Raider Blade',
          opponentAttackSourceId: null,
          sourceItemId: null,
          sourceBaseId: 'base-generated',
          sourceQualityKey: 'quality',
          sourcePrefixAffixId: 'prefix-generated',
          sourceSuffixAffixId: null,
        },
      }],
    },
  };
}
