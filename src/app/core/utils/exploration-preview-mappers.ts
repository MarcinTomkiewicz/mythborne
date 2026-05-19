import {
  ChallengeAutoResolveSuccessChancePreview,
  ChallengeAutoResolveSuccessChancePreviewRow,
  HeroExplorationDifficultyCardPreview,
  HeroExplorationDifficultyStatDetail,
  RewardGeneratedItemPreview,
  RewardGeneratedItemPreviewRow,
  TrialManifestationChancePreview,
  TrialManifestationChancePreviewRow,
  TrialOpportunityCurvePreview,
  TrialOpportunityCurvePreviewRow,
  TrialOpportunitySimulation,
  TrialOpportunitySimulationRow,
} from '../domain/exploration/exploration-preview.model';
import { GetHeroExplorationDifficultyCardPreviewsRpcRow } from '../types/exploration-runtime-rpc.types';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  mapJsonArray,
  optionalText,
  read,
  readPath,
} from './json-read';
import { trimToNull } from './normalize-text';

export function mapTrialOpportunityCurvePreview(
  row: TrialOpportunityCurvePreviewRow,
): TrialOpportunityCurvePreview {
  return {
    difficultyKey: row.difficulty_key,
    difficultyLabel: row.difficulty_label,
    projectedStepNumber: row.projected_step_number,
    dryStepCount: row.dry_step_count,
    spiritualityValue: row.spirituality_value,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    trialOpportunityChance: row.trial_opportunity_chance,
    trialOpportunityStepCap: row.trial_opportunity_step_cap,
    formulaKey: row.formula_key,
    formulaExpression: row.formula_expression,
    isGuaranteedByStepCap: row.is_guaranteed_by_step_cap,
    explanation: row.explanation,
  };
}

export function mapHeroExplorationDifficultyCardPreview(
  row: GetHeroExplorationDifficultyCardPreviewsRpcRow,
): HeroExplorationDifficultyCardPreview {
  const cardJson = row.card_json as Json;

  return {
    difficultyKey: row.difficulty_key,
    difficultyLabel: row.difficulty_label,
    difficultyDescription: row.difficulty_description,
    difficultyHelperText: trimToNull(row.difficulty_helper_text),
    isActive: row.is_active,
    isAvailable: row.is_available,
    stepDurationDisplay: row.step_duration_display,
    stepDurationSeconds: row.step_duration_seconds,
    trialOpportunityDisplay: row.trial_opportunity_display,
    trialOpportunityChance: row.trial_opportunity_chance,
    trialOpportunityIsGuaranteedByStepCap:
      row.trial_opportunity_is_guaranteed_by_step_cap,
    manifestationDisplay: row.manifestation_display,
    manifestationChance: row.manifestation_chance,
    autoResultDisplay: row.auto_result_display,
    autoResultSuccessChance: row.auto_result_success_chance,
    rewardItemCountDisplay: requiredTextValue(
      readPath(cardJson, 'rewardProfile', 'itemCount', 'display'),
      'rewardProfile.itemCount.display',
    ),
    statDetails: mapStatDetails(cardJson),
  };
}

export function mapTrialManifestationChancePreview(
  row: TrialManifestationChancePreviewRow,
): TrialManifestationChancePreview {
  return {
    trialDefinitionId: row.trial_definition_id,
    trialKey: row.trial_key,
    trialLabel: row.trial_label,
    testedStatKey: row.tested_stat_key,
    testedStatValue: row.tested_stat_value,
    difficultyKey: row.difficulty_key,
    districtCode: row.district_code,
    spiritualityValue: row.spirituality_value,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    trialPower: row.trial_power,
    rawManifestationChance: row.raw_manifestation_chance,
    maxManifestationChancePercent: row.max_manifestation_chance_percent,
    finalManifestationChance: row.final_manifestation_chance,
    formulaKey: row.formula_key,
    formulaExpression: row.formula_expression,
    explanation: row.explanation,
  };
}

function mapStatDetails(cardJson: Json): HeroExplorationDifficultyStatDetail[] {
  const rows = mapJsonArray(
    readPath(cardJson, 'trialDetailByStat', 'rows'),
    (item) => ({
      statKey: requiredTextField(item, 'statKey', 'stat_key'),
      statLabel: requiredTextField(item, 'statLabel', 'stat_label'),
      manifestationDisplay: requiredTextField(
        item,
        'manifestationDisplay',
        'manifestation_display',
      ),
      manifestationChance: requiredNumberField(
        read(
          item,
          'manifestationChance',
          'manifestation_chance',
          'manifestationPercent',
          'manifestation_percent',
        ),
        'manifestationChance',
      ),
      autoResultDisplay: requiredTextField(
        item,
        'autoResultDisplay',
        'auto_result_display',
      ),
      autoResultSuccessChance: requiredNumberField(
        read(
          item,
          'autoResultSuccessChance',
          'auto_result_success_chance',
          'autoResultChance',
          'auto_result_chance',
          'autoResultPercent',
          'auto_result_percent',
        ),
        'autoResultSuccessChance',
      ),
    }),
  );

  if (rows.length !== 9) {
    throw new Error(
      `get_hero_exploration_difficulty_card_previews expected 9 trialDetailByStat rows, received ${rows.length}.`,
    );
  }

  return rows;
}

function requiredTextField(record: JsonRecord, ...keys: string[]): string {
  return requiredTextValue(read(record, ...keys), keys[0]);
}

function requiredTextValue(value: Json | undefined, field: string): string {
  const textValue = optionalTrimmedText(value);

  if (!textValue) {
    throw new Error(
      `get_hero_exploration_difficulty_card_previews missing required card_json field: ${field}.`,
    );
  }

  return textValue;
}

function requiredNumberField(value: Json | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(
      `get_hero_exploration_difficulty_card_previews missing required numeric card_json field: ${field}.`,
    );
  }

  return value;
}

function optionalTrimmedText(value: Json | undefined): string | null {
  return trimToNull(optionalText(value));
}

export function mapChallengeAutoResolveSuccessChancePreview(
  row: ChallengeAutoResolveSuccessChancePreviewRow,
): ChallengeAutoResolveSuccessChancePreview {
  return {
    testedStatKey: row.tested_stat_key,
    testedStatValue: row.tested_stat_value,
    difficultyKey: row.difficulty_key,
    difficultyLabel: row.difficulty_label,
    difficultyMultiplier: row.difficulty_multiplier,
    spiritualityValue: row.spirituality_value,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    trialPower: row.trial_power,
    rawAutoResolveSuccessChance: row.raw_auto_resolve_success_chance,
    capPercent: row.cap_percent,
    finalAutoResolveSuccessChance: row.final_auto_resolve_success_chance,
    formulaKey: row.formula_key,
    formulaExpression: row.formula_expression,
    explanation: row.explanation,
  };
}

export function mapRewardGeneratedItemPreview(
  row: RewardGeneratedItemPreviewRow,
): RewardGeneratedItemPreview {
  return {
    previewIndex: row.preview_index,
    bucketProfileId: row.bucket_profile_id,
    bucketProfileKey: row.bucket_profile_key,
    bucketProfileName: row.bucket_profile_name,
    bucketIndex: row.bucket_index,
    rolledBudget: row.rolled_budget,
    baseId: row.base_id,
    baseKey: row.base_key,
    baseName: row.base_name,
    baseTypeKey: row.base_type_key,
    baseValue: row.base_value,
    qualityKey: row.quality_key,
    qualityLabel: row.quality_label,
    qualityMultiplier: row.quality_multiplier,
    prefixAffixId: row.prefix_affix_id,
    prefixKey: row.prefix_key,
    prefixName: row.prefix_name,
    prefixGoldValue: row.prefix_gold_value,
    suffixAffixId: row.suffix_affix_id,
    suffixKey: row.suffix_key,
    suffixName: row.suffix_name,
    suffixGoldValue: row.suffix_gold_value,
    generatedName: row.generated_name,
    drachmaValue: row.drachma_value,
    budgetBeforeQualityMultiplier: row.budget_before_quality_multiplier,
    remainingBudgetAfterBase: row.remaining_budget_after_base,
    remainingBudgetAfterPrefix: row.remaining_budget_after_prefix,
    remainingBudgetAfterSuffix: row.remaining_budget_after_suffix,
    explanation: row.explanation,
  };
}

export function mapTrialOpportunitySimulation(
  row: TrialOpportunitySimulationRow,
): TrialOpportunitySimulation {
  return {
    runIndex: row.run_index,
    difficultyKey: row.difficulty_key,
    difficultyLabel: row.difficulty_label,
    startingDryStepCount: row.starting_dry_step_count,
    maxStepsPerRun: row.max_steps_per_run,
    stepsTaken: row.steps_taken,
    trialFound: row.trial_found,
    trialStepNumber: row.trial_step_number,
    dryStepCountBeforeFinalRoll: row.dry_step_count_before_final_roll,
    finalDryStepCount: row.final_dry_step_count,
    finalTrialOpportunityChance: row.final_trial_opportunity_chance,
    finalTrialOpportunityRoll: row.final_trial_opportunity_roll,
    trialOpportunityStepCap: row.trial_opportunity_step_cap,
    rollHistoryJson: row.roll_history_json,
    explanation: row.explanation,
  };
}
