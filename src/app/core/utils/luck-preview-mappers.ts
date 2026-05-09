import {
  CombatLuckPreview,
  LuckChancePreview,
  LuckFormulaReference,
  LuckGeneratedItemPreview,
  LuckRewardRangePreview,
} from '../domain/luck/luck.model';
import { Json } from '../types/database.types';
import {
  PreviewChallengeAutoResolveSuccessChanceLuckRpcRow,
  PreviewCombatLuckFormulaContextRpcRow,
  PreviewExplorationLuckRngChainRpcRow,
  PreviewNonTrialEncounterChanceLuckRpcRow,
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
    entryId: row.entry_id,
    entryKind: row.entry_kind,
    amountMode: row.amount_mode,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    previewAmount: row.preview_amount,
    previewItemCount: row.preview_item_count,
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
    qualityKey: row.quality_key,
    qualityLabel: row.quality_label,
    qualityBaseWeight: row.quality_base_weight,
    qualityAdjustedWeight: row.quality_adjusted_weight,
    qualityRollScore: row.quality_roll_score,
    prefixChance: row.prefix_chance,
    prefixRoll: row.prefix_roll,
    suffixChance: row.suffix_chance,
    suffixRoll: row.suffix_roll,
    generatedName: row.generated_name,
    drachmaValue: row.drachma_value,
    formulaContextJson: row.formula_context_json,
    explanation: row.explanation,
  };
}

export function mapCombatLuckPreview(
  row: PreviewCombatLuckFormulaContextRpcRow,
): CombatLuckPreview {
  return {
    attackerLuck: row.attacker_luck,
    attackerLuckInfluence: row.attacker_luck_influence,
    defenderLuck: row.defender_luck,
    defenderLuckInfluence: row.defender_luck_influence,
    hitGreenZone: row.hit_green_zone,
    evasionChance: row.evasion_chance,
    criticalChance: row.critical_chance,
    criticalMultiplier: row.crit_multiplier,
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
