import {
  ChallengeAutoResolveSuccessChancePreview,
  ChallengeAutoResolveSuccessChancePreviewRow,
  RewardGeneratedItemPreview,
  RewardGeneratedItemPreviewRow,
  RewardProfilePreview,
  RewardProfilePreviewRow,
  TrialManifestationChancePreview,
  TrialManifestationChancePreviewRow,
  TrialOpportunityCurvePreview,
  TrialOpportunityCurvePreviewRow,
  TrialOpportunitySimulation,
  TrialOpportunitySimulationRow,
} from '../domain/exploration/exploration-preview.model';

export function mapTrialOpportunityCurvePreview(
  row: TrialOpportunityCurvePreviewRow,
): TrialOpportunityCurvePreview {
  return {
    difficultyKey: row.difficulty_key,
    difficultyLabel: row.difficulty_label,
    projectedStepNumber: row.projected_step_number,
    dryStepCount: row.dry_step_count,
    trialOpportunityChance: row.trial_opportunity_chance,
    trialOpportunityStepCap: row.trial_opportunity_step_cap,
    isGuaranteedByStepCap: row.is_guaranteed_by_step_cap,
    explanation: row.explanation,
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
    rawManifestationChance: row.raw_manifestation_chance,
    maxManifestationChancePercent: row.max_manifestation_chance_percent,
    finalManifestationChance: row.final_manifestation_chance,
    explanation: row.explanation,
  };
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
    rawAutoResolveSuccessChance: row.raw_auto_resolve_success_chance,
    capPercent: row.cap_percent,
    finalAutoResolveSuccessChance: row.final_auto_resolve_success_chance,
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

export function mapRewardProfilePreview(row: RewardProfilePreviewRow): RewardProfilePreview {
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
    chancePercent: row.chance_percent,
    chanceRoll: row.chance_roll,
    isIncluded: row.is_included,
    previewAmount: row.preview_amount,
    minItemCount: row.min_item_count,
    maxItemCount: row.max_item_count,
    previewItemCount: row.preview_item_count,
    maxQualityKey: row.max_quality_key,
    bucketProfileId: row.bucket_profile_id,
    generatedItemsPreviewJson: row.generated_items_preview_json,
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
