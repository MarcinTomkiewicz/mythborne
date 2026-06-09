import {
  ChallengeAutoResolveSuccessChancePreview,
  ChallengeAutoResolveSuccessChancePreviewRow,
  ExplorationDifficultyKey,
  ExplorationLockedByDifficultyKey,
  ExplorationTrialIconKey,
  HeroExplorationDifficultyCardPreview,
  HeroExplorationDifficultyLockedDisplay,
  HeroExplorationDifficultyStatDetail,
  HeroExplorationDifficultyTrialCompletion,
  HeroExplorationDifficultyTrialCompletionDisplay,
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
  optionalText,
  read,
  readPath,
  requiredArray,
  requiredBoolean,
  requiredNonNegativeInteger,
  requiredNullableText,
  requireNull,
  requiredRecord,
  requiredText,
} from './json-read';
import { trimToNull } from './normalize-text';
import { requiredSemanticIconClass } from './semantic-icon-class';

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
  const cardJsonRecord = requiredRecord(cardJson, 'difficulty card_json');
  const isUnlocked = requiredBoolean(
    read(cardJsonRecord, 'isUnlocked'),
    'difficulty card_json.isUnlocked',
  );
  const lockedDisplay = mapLockedDisplay(read(cardJsonRecord, 'lockedDisplay'));
  const trialCompletionRows = mapTrialCompletionRows(cardJsonRecord);

  assertUnlockContract(row.difficulty_key, isUnlocked, lockedDisplay);

  return {
    cardJson,
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
    autoResultPolicy: row.auto_result_policy,
    autoResultDisplay: row.auto_result_display,
    autoResultSuccessChance: row.auto_result_success_chance,
    rewardItemCountDisplay: requiredTextValue(
      readPath(cardJson, 'rewardProfile', 'itemCount', 'display'),
      'rewardProfile.itemCount.display',
    ),
    isUnlocked,
    lockedByDifficultyKey: mapLockedByDifficultyKey(
      read(cardJsonRecord, 'lockedByDifficultyKey'),
      'difficulty card_json.lockedByDifficultyKey',
    ),
    missingRequiredTrialCount: requiredNonNegativeInteger(
      read(cardJsonRecord, 'missingRequiredTrialCount'),
      'difficulty card_json.missingRequiredTrialCount',
    ),
    requiredTrialCount: requiredNonNegativeInteger(
      read(cardJsonRecord, 'requiredTrialCount'),
      'difficulty card_json.requiredTrialCount',
    ),
    lockedDisplay,
    trialCompletionRows,
    unlockPolicy: requiredRecord(
      read(cardJsonRecord, 'unlockPolicy'),
      'difficulty card_json.unlockPolicy',
    ) as Json,
    statDetails: mapStatDetails(cardJson, trialCompletionRows),
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

function mapStatDetails(
  cardJson: Json,
  trialCompletionRows: readonly HeroExplorationDifficultyTrialCompletion[],
): HeroExplorationDifficultyStatDetail[] {
  const rows = requiredArray(
    readPath(cardJson, 'trialDetailByStat', 'rows'),
    'difficulty card_json.trialDetailByStat.rows',
  ).map((item) => {
      const autoResultValue = read(
        item,
        'autoResultSuccessChance',
        'auto_result_success_chance',
        'autoResultChance',
        'auto_result_chance',
        'autoResultPercent',
        'auto_result_percent',
      );

      return {
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
        autoResultSuccessChance: requiredNumberField(autoResultValue, 'autoResultSuccessChance'),
        trialCompletion: trialCompletionForStat(
          trialCompletionRows,
          requiredTextField(item, 'statKey', 'stat_key'),
        ),
      };
    });

  if (rows.length !== 9) {
    throw new Error(
      `get_hero_exploration_difficulty_card_previews expected 9 trialDetailByStat rows, received ${rows.length}.`,
    );
  }

  return rows;
}

function mapTrialCompletionRows(
  cardJsonRecord: JsonRecord,
): HeroExplorationDifficultyTrialCompletion[] {
  const rows = requiredArray(
    read(cardJsonRecord, 'trialCompletionRows'),
    'difficulty card_json.trialCompletionRows',
  ).map(mapTrialCompletionRow);

  if (rows.length !== 9) {
    throw new Error(
      `get_hero_exploration_difficulty_card_previews expected 9 trialCompletionRows, received ${rows.length}.`,
    );
  }

  return rows;
}

function mapTrialCompletionRow(
  record: JsonRecord,
): HeroExplorationDifficultyTrialCompletion {
  return {
    difficultyKey: mapDifficultyKey(
      requiredText(read(record, 'difficultyKey'), 'trialCompletionRows.difficultyKey'),
      'trialCompletionRows.difficultyKey',
    ),
    trialDefinitionId: requiredText(
      read(record, 'trialDefinitionId'),
      'trialCompletionRows.trialDefinitionId',
    ),
    trialKey: requiredText(read(record, 'trialKey'), 'trialCompletionRows.trialKey'),
    patronKey: requireNull(
      read(record, 'patronKey'),
      'trialCompletionRows.patronKey',
    ),
    patronLabel: requiredNullableText(
      read(record, 'patronLabel'),
      'trialCompletionRows.patronLabel',
    ),
    statKey: requiredText(read(record, 'statKey'), 'trialCompletionRows.statKey'),
    statLabel: requiredText(read(record, 'statLabel'), 'trialCompletionRows.statLabel'),
    sortOrder: requiredNonNegativeInteger(
      read(record, 'sortOrder'),
      'trialCompletionRows.sortOrder',
    ),
    isCompleted: requiredBoolean(
      read(record, 'isCompleted'),
      'trialCompletionRows.isCompleted',
    ),
    completedAt: requiredNullableText(
      read(record, 'completedAt'),
      'trialCompletionRows.completedAt',
    ),
    display: mapTrialCompletionDisplay(
      requiredRecord(read(record, 'display'), 'trialCompletionRows.display'),
    ),
  };
}

function mapTrialCompletionDisplay(
  record: JsonRecord,
): HeroExplorationDifficultyTrialCompletionDisplay {
  return {
    iconKey: mapTrialIconKey(
      requiredText(read(record, 'iconKey'), 'trialCompletionRows.display.iconKey'),
      'trialCompletionRows.display.iconKey',
    ),
    tone: mapTrialCompletionTone(
      requiredText(read(record, 'tone'), 'trialCompletionRows.display.tone'),
      'trialCompletionRows.display.tone',
    ),
    ariaLabel: requiredText(
      read(record, 'ariaLabel'),
      'trialCompletionRows.display.ariaLabel',
    ),
  };
}

function mapLockedDisplay(
  value: Json | undefined,
): HeroExplorationDifficultyLockedDisplay | null {
  if (value === null) {
    return null;
  }

  const record = requiredRecord(value, 'difficulty card_json.lockedDisplay');

  return {
    iconKey: mapTrialIconKey(
      requiredText(read(record, 'iconKey'), 'lockedDisplay.iconKey'),
      'lockedDisplay.iconKey',
    ),
    tone: mapLockedDisplayTone(
      requiredText(read(record, 'tone'), 'lockedDisplay.tone'),
      'lockedDisplay.tone',
    ),
    label: requiredText(read(record, 'label'), 'lockedDisplay.label'),
    ariaLabel: requiredText(read(record, 'ariaLabel'), 'lockedDisplay.ariaLabel'),
  };
}

function trialCompletionForStat(
  rows: readonly HeroExplorationDifficultyTrialCompletion[],
  statKey: string,
): HeroExplorationDifficultyTrialCompletion {
  const row = rows.find((entry) => entry.statKey === statKey);

  if (!row) {
    throw new Error(
      `get_hero_exploration_difficulty_card_previews missing trialCompletionRows entry for statKey: ${statKey}.`,
    );
  }

  return row;
}

function assertUnlockContract(
  difficultyKey: string,
  isUnlocked: boolean,
  lockedDisplay: HeroExplorationDifficultyLockedDisplay | null,
): void {
  if (difficultyKey === 'easy' && !isUnlocked) {
    throw new Error('get_hero_exploration_difficulty_card_previews returned locked Easy difficulty.');
  }

  if (!isUnlocked && !lockedDisplay) {
    throw new Error(
      'get_hero_exploration_difficulty_card_previews returned locked difficulty without lockedDisplay.',
    );
  }
}

function mapLockedByDifficultyKey(
  value: Json | undefined,
  field: string,
): ExplorationLockedByDifficultyKey | null {
  if (value === null) {
    return null;
  }

  const key = requiredText(value, field);

  if (key === 'easy' || key === 'medium') {
    return key;
  }

  throw new Error(`${field} has unsupported value: ${key}.`);
}

function mapDifficultyKey(value: string, field: string): ExplorationDifficultyKey {
  if (value === 'easy' || value === 'medium' || value === 'hard') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function mapTrialIconKey(value: string, field: string): ExplorationTrialIconKey {
  if (value !== 'trial') {
    throw new Error(`${field} has unsupported value: ${value}.`);
  }

  requiredSemanticIconClass(value, field);
  return value;
}

function mapLockedDisplayTone(value: string, field: string): 'danger' {
  if (value === 'danger') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
}

function mapTrialCompletionTone(
  value: string,
  field: string,
): 'success' | 'danger' {
  if (value === 'success' || value === 'danger') {
    return value;
  }

  throw new Error(`${field} has unsupported value: ${value}.`);
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
