import {
  ExplorationGeneratedRewardItemReadModel,
  ExplorationChallengeRewardReadModel,
} from '../domain/exploration/exploration-reward.model';
import { Json } from '../types/database.types';
import {
  GetExplorationChallengeRewardReadModelRpcRow,
  GetExplorationStepRewardReadModelRpcRow,
} from '../types/exploration-runtime-rpc.types';
import { Row } from '../types/supabase.types';
import { jsonRecord, optionalNumber, optionalText, read } from './json-read';
import { trimText } from './normalize-text';
import { mapRewardGrantEntry } from './exploration-reward-mappers';
import { mapPlayerItemDisplayCore } from './player-item-display-core.mapper';

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

function generatedItems(value: Json): ExplorationGeneratedRewardItemReadModel[] {
  return jsonArray(value).map((entry, index) => {
    const field = `generated_items_json[${index}]`;
    const row = requiredGeneratedItemRecord(entry, field);
    const displayCore = mapPlayerItemDisplayCore(
      read(row, 'displayCore'),
      `${field}.displayCore`,
    );

    return {
      id: displayCore.itemId,
      displayCore,
      rawJson: entry,
    };
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

function requiredGeneratedItemRecord(
  value: Json,
  field: string,
): NonNullable<ReturnType<typeof jsonRecord>> {
  const record = jsonRecord(value);

  if (!record) {
    throw new Error(`${field} must be an object.`);
  }

  return record;
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
