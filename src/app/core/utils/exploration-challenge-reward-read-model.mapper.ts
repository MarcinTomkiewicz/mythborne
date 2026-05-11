import {
  ExplorationChallengeRewardReadModel,
} from '../domain/exploration/exploration-reward.model';
import { ItemReadModel } from '../domain/item/item.model';
import { Json } from '../types/database.types';
import {
  GetExplorationChallengeRewardReadModelRpcRow,
  GetExplorationStepRewardReadModelRpcRow,
} from '../types/exploration-runtime-rpc.types';
import { Row } from '../types/supabase.types';
import { jsonRecord, optionalNumber, optionalText, read } from './json-read';
import { trimText } from './normalize-text';
import { mapRewardGrantEntry } from './exploration-reward-mappers';
import { mapItemReadModel } from './item-mappers';

export function mapExplorationChallengeRewardReadModel(
  row: GetExplorationChallengeRewardReadModelRpcRow,
): ExplorationChallengeRewardReadModel {
  const rewardGrantId = trimToNull(row.reward_grant_id);
  const rewardProfileId = trimToNull(row.reward_profile_id);

  return {
    challengeAttemptId: row.challenge_attempt_id,
    challengeKind: row.challenge_kind,
    stepId: trimToNull(row.step_id),
    outcomeKind: null,
    rewardSourceKind: 'challenge_attempt',
    rewardSourceId: row.challenge_attempt_id,
    rewardSourceLabel: 'Challenge reward',
    status: row.challenge_status,
    success: row.success,
    completionMode: trimToNull(row.completion_mode),
    completedAt: trimToNull(row.completed_at),
    rewardGrantId,
    rewardGrant: rewardGrantId && rewardProfileId
      ? {
          id: rewardGrantId,
          serverId: row.server_id,
          recipientHeroId: row.hero_id,
          rewardProfileId,
          sourceKind: 'challenge_attempt',
          sourceId: row.challenge_attempt_id,
          status: trimToNull(row.reward_grant_status) ?? row.reward_status_key,
          reason: trimToNull(row.no_reward_reason_label),
          requestId: null,
          metadataJson: {},
          grantedAt: trimToNull(row.reward_granted_at) ?? '',
          createdAt: trimToNull(row.reward_granted_at) ?? '',
        }
      : null,
    entries: rewardEntries(row.reward_entries_json, rewardGrantId),
    items: generatedItems(row.generated_items_json),
    rewardStatusKey: trimToNull(row.reward_status_key),
    rewardStatusLabel: trimToNull(row.reward_status_label),
    rewardEntryCount: row.reward_entry_count,
    generatedItemCount: row.generated_item_count,
    noRewardReasonKey: trimToNull(row.no_reward_reason_key),
    noRewardReasonLabel: trimToNull(row.no_reward_reason_label),
    noRewardReasonHelperText: trimToNull(row.no_reward_reason_helper_text),
    explanation: trimToNull(row.explanation),
    rawJson: row as unknown as Json,
  };
}

export function mapExplorationStepRewardReadModel(
  row: GetExplorationStepRewardReadModelRpcRow,
): ExplorationChallengeRewardReadModel {
  const rewardGrantId = trimToNull(row.reward_grant_id);
  const rewardProfileId = trimToNull(row.reward_profile_id);
  const challengeAttemptId = trimToNull(row.challenge_attempt_id);

  return {
    challengeAttemptId: challengeAttemptId ?? '',
    challengeKind: trimToNull(row.challenge_kind) ?? 'step',
    stepId: row.step_id,
    outcomeKind: trimToNull(row.outcome_kind),
    rewardSourceKind: trimToNull(row.reward_source_kind),
    rewardSourceId: trimToNull(row.reward_source_id),
    rewardSourceLabel: trimToNull(row.reward_source_label),
    status: row.step_status,
    success: row.challenge_success,
    completionMode: trimToNull(row.challenge_completion_mode),
    completedAt: trimToNull(row.resolved_at),
    rewardGrantId,
    rewardGrant: rewardGrantId && rewardProfileId
      ? {
          id: rewardGrantId,
          serverId: row.server_id,
          recipientHeroId: row.hero_id,
          rewardProfileId,
          sourceKind: trimToNull(row.reward_source_kind) ?? 'exploration_step',
          sourceId: trimToNull(row.reward_source_id) ?? row.step_id,
          status: trimToNull(row.reward_grant_status) ?? row.reward_status_key,
          reason: trimToNull(row.no_reward_reason_label),
          requestId: null,
          metadataJson: {},
          grantedAt: trimToNull(row.reward_granted_at) ?? '',
          createdAt: trimToNull(row.reward_granted_at) ?? '',
        }
      : null,
    entries: rewardEntries(row.reward_entries_json, rewardGrantId),
    items: generatedItems(row.generated_items_json),
    rewardStatusKey: trimToNull(row.reward_status_key),
    rewardStatusLabel: trimToNull(row.reward_status_label),
    rewardEntryCount: row.reward_entry_count,
    generatedItemCount: row.generated_item_count,
    noRewardReasonKey: trimToNull(row.no_reward_reason_key),
    noRewardReasonLabel: trimToNull(row.no_reward_reason_label),
    noRewardReasonHelperText: trimToNull(row.no_reward_reason_helper_text),
    explanation: trimToNull(row.explanation),
    rawJson: row as unknown as Json,
  };
}

function rewardEntries(
  value: Json,
  fallbackRewardGrantId: string | null,
): ExplorationChallengeRewardReadModel['entries'] {
  return jsonArray(value).flatMap((entry) => {
    const row = jsonRecord(entry);
    const normalized = rewardEntryRow(row, fallbackRewardGrantId);

    return normalized ? [mapRewardGrantEntry(normalized)] : [];
  });
}

function generatedItems(value: Json): ItemReadModel[] {
  return jsonArray(value).flatMap((entry) => {
    const row = jsonRecord(entry);
    const normalized = generatedItemRow(row);

    return normalized ? [mapItemReadModel(normalized)] : [];
  });
}

function rewardEntryRow(
  row: ReturnType<typeof jsonRecord>,
  fallbackRewardGrantId: string | null,
): Row<'reward_grant_entries'> | null {
  const id = textValue(row, 'id', 'entryId', 'entry_id', 'rewardGrantEntryId', 'reward_grant_entry_id');
  const entryKind = textValue(row, 'entryKind', 'entry_kind', 'kind', 'rewardEntryKind', 'reward_entry_kind');
  const rewardGrantId =
    textValue(row, 'rewardGrantId', 'reward_grant_id', 'grantId', 'grant_id') ??
    fallbackRewardGrantId;

  if (!id || !entryKind || !rewardGrantId) {
    return null;
  }

  return {
    id,
    reward_grant_id: rewardGrantId,
    reward_profile_entry_id: textValue(row, 'rewardProfileEntryId', 'reward_profile_entry_id', 'profileEntryId', 'profile_entry_id'),
    entry_kind: entryKind,
    amount: numberOrNull(row, 'amount'),
    resource_type: textValue(row, 'resourceType', 'resource_type'),
    item_id: textValue(row, 'itemId', 'item_id', 'generatedItemId', 'generated_item_id'),
    effect_definition_id: textValue(row, 'effectDefinitionId', 'effect_definition_id'),
    source_hero_id: textValue(row, 'sourceHeroId', 'source_hero_id'),
    target_hero_id: textValue(row, 'targetHeroId', 'target_hero_id'),
    old_value_json: read(row, 'oldValueJson', 'old_value_json') ?? null,
    new_value_json: read(row, 'newValueJson', 'new_value_json') ?? null,
    metadata_json: read(row, 'metadataJson', 'metadata_json') ?? {},
    created_at: textValue(row, 'createdAt', 'created_at') ?? '',
  };
}

function generatedItemRow(row: ReturnType<typeof jsonRecord>): Row<'items'> | null {
  const id = textValue(row, 'id', 'itemId', 'item_id', 'generatedItemId', 'generated_item_id');
  const serverId = textValue(row, 'serverId', 'server_id');
  const heroId = textValue(row, 'heroId', 'hero_id');
  const name = textValue(row, 'name', 'itemName', 'item_name');
  const status = textValue(row, 'status', 'statusKey', 'status_key') as ItemReadModel['status'] | null;

  if (!id || !serverId || !heroId || !name) {
    return null;
  }

  return {
    id,
    server_id: serverId,
    hero_id: heroId,
    name,
    description: textValue(row, 'description'),
    status: status ?? 'active',
    generation_base_id: textValue(row, 'generationBaseId', 'generation_base_id', 'baseId', 'base_id', 'baseKey', 'base_key'),
    generation_quality_key: textValue(row, 'generationQualityKey', 'generation_quality_key', 'qualityKey', 'quality_key'),
    prefix_affix_id: textValue(row, 'prefixAffixId', 'prefix_affix_id', 'prefixKey', 'prefix_key'),
    suffix_affix_id: textValue(row, 'suffixAffixId', 'suffix_affix_id', 'suffixKey', 'suffix_key'),
    armory_shelf_position: numberOrNull(row, 'armoryShelfPosition', 'armory_shelf_position') ?? 0,
    drachma_value: numberOrNull(row, 'drachmaValue', 'drachma_value'),
    metadata_json: {
      ...(jsonRecord(read(row, 'metadataJson', 'metadata_json')) ?? {}),
      qualityLabel: textValue(row, 'qualityLabel', 'quality_label'),
      baseKey: textValue(row, 'baseKey', 'base_key'),
      baseName: textValue(row, 'baseName', 'base_name'),
      baseTypeKey: textValue(row, 'baseTypeKey', 'base_type_key'),
      prefixKey: textValue(row, 'prefixKey', 'prefix_key'),
      prefixName: textValue(row, 'prefixName', 'prefix_name'),
      suffixKey: textValue(row, 'suffixKey', 'suffix_key'),
      suffixName: textValue(row, 'suffixName', 'suffix_name'),
      rewardEntryIds: read(row, 'rewardEntryIds', 'reward_entry_ids') ?? null,
    },
    generated_at: textValue(row, 'generatedAt', 'generated_at') ?? '',
    scrapped_at: textValue(row, 'scrappedAt', 'scrapped_at'),
    recoverable_until: textValue(row, 'recoverableUntil', 'recoverable_until'),
    created_at: textValue(row, 'createdAt', 'created_at'),
    updated_at: textValue(row, 'updatedAt', 'updated_at') ?? '',
  };
}

function jsonArray(value: Json): Json[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as Json;

      return jsonArray(parsed);
    } catch {
      return [];
    }
  }

  const record = jsonRecord(value);
  const nested = read(record, 'rows', 'items', 'entries', 'data');

  return Array.isArray(nested) ? nested : [];
}

function textValue(
  row: ReturnType<typeof jsonRecord>,
  ...keys: string[]
): string | null {
  return optionalText(read(row, ...keys));
}

function numberOrNull(
  row: ReturnType<typeof jsonRecord>,
  ...keys: string[]
): number | null {
  return optionalNumber(read(row, ...keys));
}

function trimToNull(value: string | null | undefined): string | null {
  return trimText(value) || null;
}
