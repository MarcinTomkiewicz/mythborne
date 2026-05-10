import {
  COMBAT_ATTACK_SOURCE_KIND,
  CombatAttackPlan,
  CombatAttackSourceSnapshot,
  CombatCoreStatsSnapshot,
  CombatFormulaBonusSnapshot,
  CombatParticipantInput,
  CombatParticipantStatSnapshot,
} from '../domain/combat/combat.model';
import {
  CombatOpponentEquipmentEntryReadModel,
  ResolveCombatOpponentInput,
  ResolvedCombatOpponentEquipment,
} from '../domain/combat/combat-opponent.model';
import { Database, Json } from '../types/database.types';
import {
  optionalJsonString,
  requiredJsonArray,
  requiredJsonNumber,
  requiredJsonRecord,
  requiredJsonString,
} from './json-field-readers';
import { OPPONENT_EQUIPMENT_MODE } from './combat-opponent-equipment-resolution';

type BuildOpponentCombatantSnapshotRpcArgs =
  Database['public']['Functions']['build_opponent_combatant_snapshot_for_resolver']['Args'];

export function opponentCombatantSnapshotArgs(
  input: ResolveCombatOpponentInput,
  level: number,
): BuildOpponentCombatantSnapshotRpcArgs {
  const args: BuildOpponentCombatantSnapshotRpcArgs = {
    p_opponent_definition_id: input.opponentDefinitionId,
    p_side: input.side,
    p_reference_level: level,
    p_difficulty_multiplier: input.difficultyMultiplier,
  };

  if (input.scalingFormulaId) {
    return {
      ...args,
      p_candidate_scaling_formula_id: input.scalingFormulaId,
    };
  }

  return args;
}

export function combatParticipantInputFromDbSnapshot(snapshot: Json): CombatParticipantInput {
  const value = requiredJsonRecord(snapshot, 'opponent combatant snapshot');
  const attackPlan = combatAttackPlanFromDbSnapshot(value['attackPlan']);
  const reference = requiredJsonRecord(value['reference'], 'opponent combatant reference');

  return {
    side: requiredJsonString(value, 'side') as CombatParticipantInput['side'],
    displayName: requiredJsonString(value, 'displayName'),
    level: requiredJsonNumber(value, 'level'),
    reference: {
      participantKind: requiredJsonString(
        reference,
        'participantKind',
      ) as CombatParticipantInput['reference']['participantKind'],
      heroId: optionalJsonString(reference, 'heroId'),
      opponentDefinitionId: optionalJsonString(reference, 'opponentDefinitionId'),
    },
    stats: combatStatsFromDbSnapshot(value['stats']),
    baseStats: combatBaseStatsFromDbSnapshot(value['baseStats']),
    formulaBonuses: combatFormulaBonusesFromDbSnapshot(value['formulaBonuses']),
    attackPlan,
  };
}

export function equipmentFromDbAttackPlan(
  equipmentEntries: CombatOpponentEquipmentEntryReadModel[],
  attackPlan: CombatAttackPlan,
): ResolvedCombatOpponentEquipment[] {
  const generatedEntries = equipmentEntries.filter(
    (entry) => entry.entryMode === OPPONENT_EQUIPMENT_MODE.generated,
  );
  const generatedSources = attackPlan.slots
    .map((slot) => slot.source)
    .filter((source) => source.kind === COMBAT_ATTACK_SOURCE_KIND.opponentGenerated);

  return generatedSources.map((source, index) => {
    const entry = generatedEntries[index] ?? generatedEntries[0];

    if (!entry) {
      throw new Error('DB opponent combatant snapshot returned generated equipment without a matching equipment entry.');
    }

    return {
      kind: OPPONENT_EQUIPMENT_MODE.generated,
      equipmentEntryId: entry.id,
      slotKey: entry.slotKey,
      levelRange: {
        min: entry.minOpponentLevel,
        max: entry.maxOpponentLevel,
      },
      source,
      generatedItem: {
        displayName: source.label,
        baseId: source.sourceBaseId ?? '',
        qualityKey: source.sourceQualityKey ?? '',
        prefixAffixId: source.sourcePrefixAffixId,
        suffixAffixId: source.sourceSuffixAffixId,
        bucketProfileId: entry.generatedBucketProfileId,
        maxQualityKey: entry.generatedMaxQualityKey,
      },
    };
  });
}

function combatAttackPlanFromDbSnapshot(value: Json | undefined): CombatAttackPlan {
  const plan = requiredJsonRecord(value, 'opponent combatant attackPlan');
  const slots = requiredJsonArray(plan['slots'], 'opponent combatant attackPlan slots')
    .map((slotValue) => {
      const slot = requiredJsonRecord(slotValue, 'opponent combatant attackPlan slot');

      return {
        side: requiredJsonString(slot, 'side') as CombatAttackPlan['side'],
        slotIndex: requiredJsonNumber(slot, 'slotIndex'),
        initiativeScore: requiredJsonNumber(slot, 'initiativeScore'),
        source: combatAttackSourceFromDbSnapshot(slot['source']),
      };
    });

  return {
    side: requiredJsonString(plan, 'side') as CombatAttackPlan['side'],
    slots,
  };
}

function combatAttackSourceFromDbSnapshot(value: Json | undefined): CombatAttackSourceSnapshot {
  const source = requiredJsonRecord(value, 'opponent combatant attack source');

  return {
    kind: requiredJsonString(source, 'kind') as CombatAttackSourceSnapshot['kind'],
    label: requiredJsonString(source, 'label'),
    opponentAttackSourceId: optionalJsonString(source, 'opponentAttackSourceId'),
    sourceItemId: optionalJsonString(source, 'sourceItemId'),
    sourceBaseId: optionalJsonString(source, 'sourceBaseId'),
    sourceQualityKey: optionalJsonString(source, 'sourceQualityKey'),
    sourcePrefixAffixId: optionalJsonString(source, 'sourcePrefixAffixId'),
    sourceSuffixAffixId: optionalJsonString(source, 'sourceSuffixAffixId'),
  };
}

function combatStatsFromDbSnapshot(value: Json | undefined): CombatCoreStatsSnapshot {
  const stats = requiredJsonRecord(value, 'opponent combatant stats');

  return {
    maxHealth: requiredJsonNumber(stats, 'maxHealth'),
    defense: requiredJsonNumber(stats, 'defense'),
    minDamage: requiredJsonNumber(stats, 'minDamage'),
    maxDamage: requiredJsonNumber(stats, 'maxDamage'),
    luck: requiredJsonNumber(stats, 'luck'),
    criticalChance: requiredJsonNumber(stats, 'criticalChance'),
    criticalDamage: requiredJsonNumber(stats, 'criticalDamage'),
    evasionChance: requiredJsonNumber(stats, 'evasionChance'),
  };
}

function combatBaseStatsFromDbSnapshot(value: Json | undefined): CombatParticipantStatSnapshot[] {
  return requiredJsonArray(value, 'opponent combatant baseStats').map((entry) => {
    const stat = requiredJsonRecord(entry, 'opponent combatant base stat');

    return {
      side: requiredJsonString(stat, 'side') as CombatParticipantStatSnapshot['side'],
      statKey: requiredJsonString(stat, 'statKey'),
      statValue: requiredJsonNumber(stat, 'statValue'),
    };
  });
}

function combatFormulaBonusesFromDbSnapshot(value: Json | undefined): CombatFormulaBonusSnapshot {
  const bonuses = requiredJsonRecord(value, 'opponent combatant formulaBonuses');

  return {
    hitBonusFromItems: requiredJsonNumber(bonuses, 'hitBonusFromItems'),
    critBonusFromItems: requiredJsonNumber(bonuses, 'critBonusFromItems'),
    evasionBonusFromItems: requiredJsonNumber(bonuses, 'evasionBonusFromItems'),
    damageBonusFromItems: requiredJsonNumber(bonuses, 'damageBonusFromItems'),
  };
}
