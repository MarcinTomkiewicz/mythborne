import {
  RewardGrantEntryReadModel,
  RewardGrantReadModel,
  RewardProfileAssignmentReadModel,
  RewardProfileEntryReadModel,
  RewardProfileReadModel,
} from '../domain/exploration/exploration-reward.model';
import { Row } from '../types/supabase.types';

export function mapRewardProfile(row: Row<'reward_profiles'>): RewardProfileReadModel {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    category: row.category,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapRewardProfileEntry(
  row: Row<'reward_profile_entries'>,
): RewardProfileEntryReadModel {
  return {
    id: row.id,
    rewardProfileId: row.reward_profile_id,
    entryKind: row.entry_kind,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    adminDescription: row.admin_description,
    amountMode: row.amount_mode,
    minAmount: row.min_amount,
    maxAmount: row.max_amount,
    resourceType: row.resource_type,
    formulaId: row.formula_id,
    chancePercent: row.chance_percent,
    minItemCount: row.min_item_count,
    maxItemCount: row.max_item_count,
    maxQualityKey: row.max_quality_key,
    bucketProfileId: row.bucket_profile_id,
    effectDefinitionId: row.effect_definition_id,
    transferSourceRole: row.transfer_source_role,
    transferRecipientRole: row.transfer_recipient_role,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapRewardProfileAssignment(
  row: Row<'reward_profile_assignments'>,
): RewardProfileAssignmentReadModel {
  return {
    id: row.id,
    rewardProfileId: row.reward_profile_id,
    sourceKind: row.source_kind,
    outcomeKind: row.outcome_kind,
    trialDefinitionId: row.trial_definition_id,
    encounterDefinitionId: row.encounter_definition_id,
    difficultyKey: row.difficulty_key,
    districtCode: row.district_code,
    description: row.description,
    helperText: row.helper_text,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapRewardGrant(row: Row<'reward_grants'>): RewardGrantReadModel {
  return {
    id: row.id,
    serverId: row.server_id,
    recipientHeroId: row.recipient_hero_id,
    rewardProfileId: row.reward_profile_id,
    sourceKind: row.source_kind,
    sourceId: row.source_id,
    status: row.status,
    reason: row.reason,
    requestId: row.request_id,
    metadataJson: row.metadata_json,
    grantedAt: row.granted_at,
    createdAt: row.created_at,
  };
}

export function mapRewardGrantEntry(
  row: Row<'reward_grant_entries'>,
): RewardGrantEntryReadModel {
  return {
    id: row.id,
    rewardGrantId: row.reward_grant_id,
    rewardProfileEntryId: row.reward_profile_entry_id,
    entryKind: row.entry_kind,
    amount: row.amount,
    resourceType: row.resource_type,
    itemId: row.item_id,
    effectDefinitionId: row.effect_definition_id,
    sourceHeroId: row.source_hero_id,
    targetHeroId: row.target_hero_id,
    oldValueJson: row.old_value_json,
    newValueJson: row.new_value_json,
    metadataJson: row.metadata_json,
    createdAt: row.created_at,
  };
}
