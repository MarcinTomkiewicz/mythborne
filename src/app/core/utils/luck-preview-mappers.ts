import {
  CombatLuckPreview,
  LuckChancePreview,
  LuckFormulaReference,
  LuckGeneratedItemAffixPreview,
  LuckGeneratedItemPreview,
  LuckLabDistributionRow,
  LuckLabDropDistributionMetrics,
  LuckLabDropDistributionSummary,
  LuckRewardRangePreview,
} from '../domain/luck/luck.model';
import { Json } from '../types/database.types';
import {
  PreviewChallengeAutoResolveSuccessChanceLuckRpcRow,
  PreviewCombatLuckFormulaContextRpcRow,
  PreviewExplorationLuckRngChainRpcRow,
  PreviewNonTrialEncounterChanceLuckRpcRow,
  PreviewRewardGeneratedItemDistributionLuckRpcRow,
  PreviewRewardGeneratedItemLuckRpcRow,
  PreviewRewardProfileLuckRpcRow,
  PreviewTrialManifestationChanceLuckRpcRow,
  PreviewTrialOpportunityCurveLuckRpcRow,
} from '../types/luck-rpc.types';
import { jsonValue } from './json-read';

export function mapTrialOpportunityChancePreview(
  row: PreviewTrialOpportunityCurveLuckRpcRow,
): LuckChancePreview {
  return mapChancePreview({
    surfaceKey: 'trial_opportunity',
    categoryKey: 'exploration',
    testedStatKey: null,
    testedStatValue: null,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    trialPower: null,
    chancePercent: row.trial_opportunity_chance,
    roll: null,
    resultKey: row.is_guaranteed_by_step_cap ? 'guaranteed_by_step_cap' : null,
    formulaKey: row.formula_key,
    formulaExpression: row.formula_expression,
    explanation: row.explanation,
    contextJson: {
      baseChance: row.base_chance,
      dryStepCount: row.dry_step_count,
      perDryStepChance: row.per_dry_step_chance,
      projectedStepNumber: row.projected_step_number,
      spiritualityValue: row.spirituality_value,
      trialOpportunityStepCap: row.trial_opportunity_step_cap,
    },
  });
}

export function mapTrialManifestationChancePreview(
  row: PreviewTrialManifestationChanceLuckRpcRow,
): LuckChancePreview {
  return mapChancePreview({
    surfaceKey: 'trial_manifestation',
    categoryKey: 'trial',
    testedStatKey: row.tested_stat_key,
    testedStatValue: row.tested_stat_value,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    trialPower: row.trial_power,
    chancePercent: row.final_manifestation_chance,
    roll: null,
    resultKey: null,
    formulaKey: row.formula_key,
    formulaExpression: row.formula_expression,
    explanation: row.explanation,
    contextJson: {
      difficultyKey: row.difficulty_key,
      districtCode: row.district_code,
      maxManifestationChancePercent: row.max_manifestation_chance_percent,
      rawManifestationChance: row.raw_manifestation_chance,
      trialDefinitionId: row.trial_definition_id,
      trialKey: row.trial_key,
      trialLabel: row.trial_label,
    },
  });
}

export function mapChallengeAutoResolveChancePreview(
  row: PreviewChallengeAutoResolveSuccessChanceLuckRpcRow,
): LuckChancePreview {
  return mapChancePreview({
    surfaceKey: 'challenge_auto_resolve',
    categoryKey: 'trial',
    testedStatKey: row.tested_stat_key,
    testedStatValue: row.tested_stat_value,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    trialPower: row.trial_power,
    chancePercent: row.final_auto_resolve_success_chance,
    roll: null,
    resultKey: null,
    formulaKey: row.formula_key,
    formulaExpression: row.formula_expression,
    explanation: row.explanation,
    contextJson: {
      capPercent: row.cap_percent,
      difficultyKey: row.difficulty_key,
      difficultyMultiplier: row.difficulty_multiplier,
      manualChanceReference: row.manual_chance_reference,
      rawAutoResolveSuccessChance: row.raw_auto_resolve_success_chance,
      spiritualityValue: row.spirituality_value,
    },
  });
}

export function mapNonTrialEncounterChancePreview(
  row: PreviewNonTrialEncounterChanceLuckRpcRow,
): LuckChancePreview {
  return mapChancePreview({
    surfaceKey: 'non_trial_encounter',
    categoryKey: 'exploration',
    testedStatKey: null,
    testedStatValue: null,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    trialPower: null,
    chancePercent: row.final_encounter_chance,
    roll: null,
    resultKey: null,
    formulaKey: row.formula_key,
    formulaExpression: row.formula_expression,
    explanation: row.explanation,
    contextJson: {
      baseChance: row.base_chance,
      capPercent: row.cap_percent,
      difficultyKey: row.difficulty_key,
      districtCode: row.district_code,
      rawEncounterChance: row.raw_encounter_chance,
      spiritualityValue: row.spirituality_value,
    },
  });
}

export function mapExplorationLuckRngChainPreview(
  row: PreviewExplorationLuckRngChainRpcRow,
): LuckChancePreview {
  return mapChancePreview({
    surfaceKey: 'exploration_rng_chain',
    categoryKey: 'exploration',
    testedStatKey: null,
    testedStatValue: row.tested_stat_value,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    trialPower: row.trial_power,
    chancePercent: row.trial_opportunity_chance,
    roll: null,
    resultKey: null,
    formulaKey: null,
    formulaExpression: null,
    explanation: row.explanation,
    contextJson: {
      absoluteEncounterProbability: row.absolute_encounter_probability,
      absoluteManifestedTrialProbability: row.absolute_manifested_trial_probability,
      absoluteUnmanifestedTrialOpportunityProbability:
        row.absolute_unmanifested_trial_opportunity_probability,
      encounterChanceIfNoTrial: row.encounter_chance_if_no_trial,
      formulasJson: row.formulas_json,
      nonTrialProbability: row.non_trial_probability,
      nothingProbability: row.nothing_probability,
      trialManifestationChanceIfOpportunity:
        row.trial_manifestation_chance_if_opportunity,
    },
  });
}

export function mapRewardProfileLuckPreview(
  row: PreviewRewardProfileLuckRpcRow,
): LuckRewardRangePreview {
  return {
    previewRunIndex: row.preview_run_index,
    rewardProfileId: row.reward_profile_id,
    rewardProfileKey: row.reward_profile_key,
    rewardProfileLabel: row.reward_profile_label,
    rewardProfileDescription: row.reward_profile_description,
    entryId: row.entry_id,
    entryKind: row.entry_kind,
    entryLabel: row.entry_label,
    entryDescription: row.entry_description,
    effectDefinitionId: row.effect_definition_id,
    amountMode: row.amount_mode,
    resourceType: row.resource_type,
    spiritualityValue: row.spirituality_value,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    previewAmount: row.preview_amount,
    previewItemCount: row.preview_item_count,
    minItemCount: row.min_item_count,
    maxItemCount: row.max_item_count,
    maxQualityKey: row.max_quality_key,
    bucketProfileId: row.bucket_profile_id,
    chancePercent: row.chance_percent,
    chanceRoll: row.chance_roll,
    isIncluded: row.is_included,
    formulaContextJson: row.formula_context_json,
    luckPolicyJson: row.luck_policy_json,
    generatedItemsPreviewJson: row.generated_items_preview_json,
    explanation: row.explanation,
  };
}

export function mapRewardGeneratedItemLuckPreview(
  row: PreviewRewardGeneratedItemLuckRpcRow,
): LuckGeneratedItemPreview {
  return {
    previewIndex: row.preview_index,
    bucketProfileId: row.bucket_profile_id,
    bucketProfileKey: row.bucket_profile_key,
    bucketProfileName: row.bucket_profile_name,
    bucketIndex: row.bucket_index,
    rolledBudget: row.rolled_budget,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    baseId: row.base_id,
    baseKey: row.base_key,
    baseName: row.base_name,
    baseTypeKey: row.base_type_key,
    baseValue: row.base_value,
    qualityKey: row.quality_key,
    qualityLabel: row.quality_label,
    qualityMultiplier: row.quality_multiplier,
    qualityBaseWeight: row.quality_base_weight,
    qualityAdjustedWeight: row.quality_adjusted_weight,
    qualityRollScore: row.quality_roll_score,
    prefixAffix: mapGeneratedItemAffixPreview({
      affixId: row.prefix_affix_id,
      key: row.prefix_key,
      name: row.prefix_name,
      goldValue: row.prefix_gold_value,
      chance: row.prefix_chance,
      roll: row.prefix_roll,
    }),
    suffixAffix: mapGeneratedItemAffixPreview({
      affixId: row.suffix_affix_id,
      key: row.suffix_key,
      name: row.suffix_name,
      goldValue: row.suffix_gold_value,
      chance: row.suffix_chance,
      roll: row.suffix_roll,
    }),
    generatedName: row.generated_name,
    drachmaValue: row.drachma_value,
    budgetBeforeQualityMultiplier: row.budget_before_quality_multiplier,
    remainingBudgetAfterBase: row.remaining_budget_after_base,
    remainingBudgetAfterPrefix: row.remaining_budget_after_prefix,
    remainingBudgetAfterSuffix: row.remaining_budget_after_suffix,
    formulaContextJson: row.formula_context_json,
    explanation: row.explanation,
  };
}

export function mapRewardGeneratedItemDistributionLuckPreview(
  row: PreviewRewardGeneratedItemDistributionLuckRpcRow,
): LuckLabDropDistributionSummary {
  return {
    status: 'available',
    sampleSize: row.roll_count,
    highValueThreshold: row.high_value_threshold,
    current: {
      luckValue: row.luck_value,
      luckInfluence: row.luck_influence,
      averageItemValue: row.average_item_value,
      medianItemValue: row.median_item_value,
      minItemValue: row.min_item_value,
      maxItemValue: row.max_item_value,
      prefixHitRate: row.prefix_hit_rate,
      suffixHitRate: row.suffix_hit_rate,
      highValueRate: row.high_value_rate,
      outstandingRate: row.outstanding_rate,
    },
    comparison: {
      luckValue: row.compare_luck_value,
      luckInfluence: row.compare_luck_influence,
      averageItemValue: row.compare_average_item_value,
      medianItemValue: row.compare_median_item_value,
      minItemValue: row.compare_min_item_value,
      maxItemValue: row.compare_max_item_value,
      prefixHitRate: row.compare_prefix_hit_rate,
      suffixHitRate: row.compare_suffix_hit_rate,
      highValueRate: row.compare_high_value_rate,
      outstandingRate: row.compare_outstanding_rate,
    },
    averageDelta: row.average_delta,
    averageDeltaPercent: row.average_delta_percent,
    bucketRows: mapDistributionRows(row.bucket_distribution_json),
    qualityRows: mapDistributionRows(row.quality_distribution_json),
    compareBucketRows: mapDistributionRows(row.compare_bucket_distribution_json),
    compareQualityRows: mapDistributionRows(row.compare_quality_distribution_json),
    reason: row.explanation,
    explanation: row.explanation,
    formulaContextJson: jsonValue(row.formula_context_json),
    summaryJson: jsonValue(row.summary_json),
  };
}

function mapGeneratedItemAffixPreview(input: {
  affixId: string;
  key: string;
  name: string;
  goldValue: number;
  chance: number;
  roll: number;
}): LuckGeneratedItemAffixPreview | null {
  return input.affixId || input.key || input.name
    ? {
        affixId: input.affixId,
        key: input.key,
        name: input.name,
        goldValue: input.goldValue,
        chance: input.chance,
        roll: input.roll,
      }
    : null;
}

function mapDistributionRows(value: Json): LuckLabDistributionRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(mapDistributionRow)
    .filter((row): row is LuckLabDistributionRow => row !== null);
}

function mapDistributionRow(value: unknown): LuckLabDistributionRow | null {
  if (!isRecord(value)) {
    return null;
  }

  const key = textField(value, 'key');
  const label = textField(value, 'label');
  const count = numberField(value, 'count');
  const percent = numberField(value, 'percent');

  return key !== null && label !== null && count !== null && percent !== null
    ? { key, label, count, percent }
    : null;
}

function textField(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];

  return typeof value === 'string' ? value : null;
}

function numberField(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];

  return typeof value === 'number' ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mapCombatLuckPreview(
  row: PreviewCombatLuckFormulaContextRpcRow,
): CombatLuckPreview {
  return {
    attackCount: row.attack_count,
    attackIndex: row.attack_index,
    attackerCunning: row.attacker_cunning,
    attackerDexterity: row.attacker_dexterity,
    attackerLuck: row.attacker_luck,
    attackerLuckInfluence: row.attacker_luck_influence,
    combatantAgility: row.combatant_agility,
    combatantIntelligence: row.combatant_intelligence,
    critBonusFromItems: row.crit_bonus_from_items,
    defenderLuck: row.defender_luck,
    defenderLuckInfluence: row.defender_luck_influence,
    defenderAgility: row.defender_agility,
    defenderDefense: row.defender_defense,
    evasionBonusFromItems: row.evasion_bonus_from_items,
    hitGreenZone: row.hit_green_zone,
    hitBonusFromItems: row.hit_bonus_from_items,
    evasionChance: row.evasion_chance,
    criticalChance: row.critical_chance,
    criticalMultiplier: row.crit_multiplier,
    initiativeScore: row.initiative_score,
    rolledDamage: row.rolled_damage,
    finalDamage: row.final_damage,
    formulasJson: row.formulas_json,
    explanation: row.explanation,
  };
}

function mapChancePreview(input: {
  surfaceKey: string;
  categoryKey: string;
  testedStatKey: string | null;
  testedStatValue: number | null;
  luckValue: number;
  luckInfluence: number;
  trialPower: number | null;
  chancePercent: number | null;
  roll: number | null;
  resultKey: string | null;
  formulaKey: string | null;
  formulaExpression: string | null;
  explanation: string;
  contextJson: Json;
}): LuckChancePreview {
  return {
    surfaceKey: input.surfaceKey,
    categoryKey: input.categoryKey,
    testedStatKey: input.testedStatKey,
    testedStatValue: input.testedStatValue,
    luckValue: input.luckValue,
    luckInfluence: input.luckInfluence,
    trialPower: input.trialPower,
    chancePercent: input.chancePercent,
    roll: input.roll,
    resultKey: input.resultKey,
    formula: mapFormula(input.formulaKey, input.formulaExpression),
    explanation: input.explanation,
    contextJson: jsonValue(input.contextJson),
  };
}

function mapFormula(
  formulaKey: string | null,
  formulaExpression: string | null,
): LuckFormulaReference | null {
  return formulaKey && formulaExpression
    ? { formulaKey, formulaExpression }
    : null;
}
