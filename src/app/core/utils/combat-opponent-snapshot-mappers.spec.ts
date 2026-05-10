import { COMBAT_SIDE } from '../domain/combat/combat.model';
import {
  combatParticipantInputFromDbSnapshot,
  equipmentFromDbAttackPlan,
  opponentCombatantSnapshotArgs,
} from './combat-opponent-snapshot-mappers';

describe('combat opponent snapshot mappers', () => {
  it('builds DB opponent combatant snapshot args with candidate formula when present', () => {
    expect(opponentCombatantSnapshotArgs({
      opponentDefinitionId: 'opponent-1',
      side: COMBAT_SIDE.defender,
      heroLevel: 4,
      opponentLevel: 5,
      difficultyMultiplier: 1.25,
      scalingFormulaId: 'formula-1',
    }, 5)).toEqual({
      p_opponent_definition_id: 'opponent-1',
      p_side: 'defender',
      p_reference_level: 5,
      p_difficulty_multiplier: 1.25,
      p_candidate_scaling_formula_id: 'formula-1',
    });
  });

  it('maps DB helper contract JSON to combat participant input', () => {
    const participant = combatParticipantInputFromDbSnapshot(
      opponentCombatantSnapshotFromMigratorContract(),
    );

    expect(participant.displayName).toBe('Bandit');
    expect(participant.reference.opponentDefinitionId).toBe('opponent-1');
    expect(participant.stats.maxHealth).toBe(15);
    expect(participant.baseStats[0].statKey).toBe('health');
    expect(participant.attackPlan.slots[0].source).toEqual(jasmine.objectContaining({
      kind: 'opponent_generated',
      label: 'Generated Raider Blade',
      sourceBaseId: 'base-generated',
      sourceQualityKey: 'quality',
    }));
  });

  it('maps generated equipment from DB attack plan sources', () => {
    const participant = combatParticipantInputFromDbSnapshot(
      opponentCombatantSnapshotFromMigratorContract(),
    );
    const equipment = equipmentFromDbAttackPlan([{
      id: 'equipment-1',
      opponentDefinitionId: 'opponent-1',
      slotKey: 'main_hand',
      entryMode: 'generated',
      manualBaseId: null,
      manualQualityKey: null,
      manualPrefixAffixId: null,
      manualSuffixAffixId: null,
      generatedBucketProfileId: 'bucket-1',
      generatedMaxQualityKey: 'quality',
      minOpponentLevel: null,
      maxOpponentLevel: null,
      sortOrder: 10,
      isActive: true,
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    }], participant.attackPlan);

    expect(equipment[0].generatedItem).toEqual(jasmine.objectContaining({
      displayName: 'Generated Raider Blade',
      baseId: 'base-generated',
      qualityKey: 'quality',
      bucketProfileId: 'bucket-1',
      maxQualityKey: 'quality',
    }));
  });

  it('throws readable errors for malformed DB snapshot JSON', () => {
    expect(() => combatParticipantInputFromDbSnapshot({ displayName: 'Bandit' })).toThrowError(
      'DB opponent combatant attackPlan is missing or malformed.',
    );
  });
});

// Shape mirrors Migrator's `build_opponent_combatant_snapshot_for_resolver(...)`
// jsonb contract: participant fields plus DB-owned fight-local equipment attackPlan.
function opponentCombatantSnapshotFromMigratorContract() {
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
