import {
  UpsertRewardOutcomeKindInput,
  UpsertRewardProfileEntryInput,
  UpsertRewardProfileInput,
} from '../domain/exploration/exploration-reward.model';
import {
  DeactivateRewardOutcomeKindRpcArgs,
  DeactivateRewardProfileEntryRpcArgs,
  DeactivateRewardProfileRpcArgs,
  UpsertRewardOutcomeKindRpcArgs,
  UpsertRewardProfileEntryRpcArgs,
  UpsertRewardProfileRpcArgs,
} from '../types/reward-profile-admin-rpc.types';
import {
  addOptionalNumber,
  addOptionalText,
  percent,
  requiredText,
} from './admin-rpc-helpers';

export function toUpsertRewardOutcomeKindRpcArgs(
  input: UpsertRewardOutcomeKindInput,
): UpsertRewardOutcomeKindRpcArgs {
  const args: UpsertRewardOutcomeKindRpcArgs = {
    p_source_kind: requiredText(input.sourceKind, 'sourceKind'),
    p_key: requiredText(input.key, 'key'),
    p_label: requiredText(input.label, 'label'),
    p_description: requiredText(input.description, 'description'),
    p_sort_order: input.sortOrder,
    p_is_active: input.isActive,
    p_metadata_json: input.metadataJson,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_helper_text', input.helperText);
  addOptionalText(args, 'p_admin_description', input.adminDescription);

  return args;
}

export function toDeactivateRewardOutcomeKindRpcArgs(
  sourceKind: string,
  key: string,
  reason: string,
): DeactivateRewardOutcomeKindRpcArgs {
  return {
    p_source_kind: requiredText(sourceKind, 'sourceKind'),
    p_key: requiredText(key, 'key'),
    p_reason: requiredText(reason, 'reason'),
  };
}

export function toUpsertRewardProfileRpcArgs(
  input: UpsertRewardProfileInput,
): UpsertRewardProfileRpcArgs {
  const args: UpsertRewardProfileRpcArgs = {
    p_key: requiredText(input.key, 'key'),
    p_label: requiredText(input.label, 'label'),
    p_category: requiredText(input.category, 'category'),
    p_description: requiredText(input.description, 'description'),
    p_sort_order: input.sortOrder,
    p_is_active: input.isActive,
    p_metadata_json: input.metadataJson,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_reward_profile_id', input.rewardProfileId);
  addOptionalText(args, 'p_helper_text', input.helperText);
  addOptionalText(args, 'p_admin_description', input.adminDescription);

  return args;
}

export function toDeactivateRewardProfileRpcArgs(
  rewardProfileId: string,
  reason: string,
): DeactivateRewardProfileRpcArgs {
  return {
    p_reward_profile_id: requiredText(rewardProfileId, 'rewardProfileId'),
    p_reason: requiredText(reason, 'reason'),
  };
}

export function toUpsertRewardProfileEntryRpcArgs(
  input: UpsertRewardProfileEntryInput,
): UpsertRewardProfileEntryRpcArgs {
  const args: UpsertRewardProfileEntryRpcArgs = {
    p_reward_profile_id: requiredText(input.rewardProfileId, 'rewardProfileId'),
    p_entry_kind: requiredText(input.entryKind, 'entryKind'),
    p_label: requiredText(input.label, 'label'),
    p_description: requiredText(input.description, 'description'),
    p_amount_mode: requiredText(input.amountMode, 'amountMode'),
    p_chance_percent: percent(input.chancePercent, 'chancePercent'),
    p_sort_order: input.sortOrder,
    p_is_active: input.isActive,
    p_metadata_json: input.metadataJson,
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_entry_id', input.entryId);
  addOptionalText(args, 'p_helper_text', input.helperText);
  addOptionalText(args, 'p_admin_description', input.adminDescription);
  addOptionalNumber(args, 'p_min_amount', input.minAmount);
  addOptionalNumber(args, 'p_max_amount', input.maxAmount);
  addOptionalText(args, 'p_resource_type', input.resourceType);
  addOptionalText(args, 'p_formula_id', input.formulaId);
  addOptionalNumber(args, 'p_min_item_count', input.minItemCount);
  addOptionalNumber(args, 'p_max_item_count', input.maxItemCount);
  addOptionalText(args, 'p_max_quality_key', input.maxQualityKey);
  addOptionalText(args, 'p_bucket_profile_id', input.bucketProfileId);
  addOptionalText(args, 'p_effect_definition_id', input.effectDefinitionId);

  return args;
}

export function toDeactivateRewardProfileEntryRpcArgs(
  entryId: string,
  reason: string,
): DeactivateRewardProfileEntryRpcArgs {
  return {
    p_entry_id: requiredText(entryId, 'entryId'),
    p_reason: requiredText(reason, 'reason'),
  };
}
