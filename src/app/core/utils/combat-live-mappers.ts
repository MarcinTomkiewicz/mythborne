import {
  CombatLiveEventReadModel,
  CombatLiveParticipantReadModel,
  CombatLiveStateReadModel,
  CombatResultDetailReadModel,
  CombatTimingInput,
  CombatTimingManifestReadModel,
} from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import {
  EnsureExplorationCombatSessionRpcArgs,
  EnsureExplorationCombatSessionRpcRow,
  GetCombatLiveStateRpcArgs,
  GetCombatLiveStateRpcRow,
  GetCombatResultDetailRpcArgs,
  GetCombatResultDetailRpcRow,
  SubmitCombatPlayerActionRpcArgs,
  SubmitCombatPlayerActionRpcRow,
} from '../types/combat-live-rpc.types';
import { trimText, trimToNull } from './normalize-text';

type LiveStateRpcRow =
  | EnsureExplorationCombatSessionRpcRow
  | GetCombatLiveStateRpcRow
  | SubmitCombatPlayerActionRpcRow;

type JsonRecord = Record<string, unknown>;

export function toEnsureExplorationCombatSessionRpcArgs(input: {
  challengeAttemptId: string | null | undefined;
  requestId?: string | null;
}): EnsureExplorationCombatSessionRpcArgs {
  const args: EnsureExplorationCombatSessionRpcArgs = {
    p_challenge_attempt_id: requiredText(
      input.challengeAttemptId,
      'challengeAttemptId',
    ),
  };
  const requestId = trimToNull(input.requestId);

  if (requestId) {
    args.p_request_id = requestId;
  }

  return args;
}

export function toGetCombatLiveStateRpcArgs(input: {
  sessionId: string | null | undefined;
  sinceEventIndex?: number | null;
}): GetCombatLiveStateRpcArgs {
  const args: GetCombatLiveStateRpcArgs = {
    p_session_id: requiredText(input.sessionId, 'sessionId'),
  };
  const since = optionalNonNegativeInteger(input.sinceEventIndex);

  if (since !== null) {
    args.p_since_event_index = since;
  }

  return args;
}

export function toSubmitCombatPlayerActionRpcArgs(input: {
  sessionId: string | null | undefined;
  timingInput: CombatTimingInput;
  requestId: string | null | undefined;
}): SubmitCombatPlayerActionRpcArgs {
  return {
    p_session_id: requiredText(input.sessionId, 'sessionId'),
    p_timing_input_json: {
      positionPercent: normalizedPercent(input.timingInput.positionPercent),
    },
    p_request_id: requiredText(input.requestId, 'requestId'),
  };
}

export function toGetCombatResultDetailRpcArgs(input: {
  combatResultId: string | null | undefined;
}): GetCombatResultDetailRpcArgs {
  return {
    p_combat_result_id: requiredText(input.combatResultId, 'combatResultId'),
  };
}

export function firstCombatLiveStateRow<T extends LiveStateRpcRow>(
  rows: readonly T[],
): T {
  const row = rows[0];

  if (!row) {
    throw new Error('DB nie zwróciła stanu sesji walki.');
  }

  return row;
}

export function firstCombatResultDetailRow(
  rows: readonly GetCombatResultDetailRpcRow[],
): GetCombatResultDetailRpcRow {
  const row = rows[0];

  if (!row) {
    throw new Error('DB nie zwróciła szczegółów wyniku walki.');
  }

  return row;
}

export function mapCombatLiveState(row: LiveStateRpcRow): CombatLiveStateReadModel {
  const participants = toArray(row.participants_json)
    .map(mapParticipant)
    .filter((entry): entry is CombatLiveParticipantReadModel => entry !== null);
  const events = toArray(row.events_json)
    .map(mapEvent)
    .filter((entry): entry is CombatLiveEventReadModel => entry !== null)
    .sort((a, b) => a.eventIndex - b.eventIndex);
  const currentTimingManifest = mapTimingManifest(row.current_timing_manifest_json);

  return {
    sessionId: row.combat_session_id,
    serverId: row.server_id,
    sourceType: row.source_type,
    sourceEntityType: row.source_entity_type,
    sourceEntityId: row.source_entity_id,
    statusKey: row.status_key,
    statusLabel: row.status_label,
    currentRoundNumber: row.current_round_number,
    currentActionIndex: row.current_action_index,
    currentActorParticipantId: row.current_actor_participant_id ?? null,
    awaitingPlayerAction: row.awaiting_player_action,
    currentTimingManifest,
    participants,
    events,
    finalCombatResultId: row.final_combat_result_id ?? null,
    eventCount: row.event_count,
    updatedAt: row.updated_at,
    rawJson: row as unknown as Json,
  };
}

export function mergeCombatLiveEvents(
  previous: CombatLiveStateReadModel | null,
  next: CombatLiveStateReadModel,
): CombatLiveStateReadModel {
  if (!previous || previous.sessionId !== next.sessionId) {
    return next;
  }

  const byIndex = new Map<number, CombatLiveEventReadModel>();

  for (const event of previous.events) {
    byIndex.set(event.eventIndex, event);
  }

  for (const event of next.events) {
    byIndex.set(event.eventIndex, event);
  }

  return {
    ...next,
    events: Array.from(byIndex.values()).sort((a, b) => a.eventIndex - b.eventIndex),
  };
}

export function mapCombatResultDetail(
  row: GetCombatResultDetailRpcRow,
): CombatResultDetailReadModel {
  return {
    combatResultId: row.combat_result_id,
    outcome: row.outcome,
    winnerSide: row.winner_side ?? null,
    loserSide: row.loser_side ?? null,
    turnsCompleted: row.turns_completed,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    participants: row.participants_json,
    attacks: row.attacks_json,
    rawJson: row as unknown as Json,
  };
}

function mapTimingManifest(value: Json): CombatTimingManifestReadModel | null {
  const record = toRecord(value);

  if (!record) {
    return null;
  }

  const start = firstNumber(record, [
    'zoneStartPercent',
    'zone_start_percent',
    'greenZoneStartPercent',
    'green_zone_start_percent',
    'zoneStart',
    'zone_start',
  ]);
  const end = firstNumber(record, [
    'zoneEndPercent',
    'zone_end_percent',
    'greenZoneEndPercent',
    'green_zone_end_percent',
    'zoneEnd',
    'zone_end',
  ]);
  const width = firstNumber(record, [
    'zoneWidthPercent',
    'zone_width_percent',
    'greenZoneWidthPercent',
    'green_zone_width_percent',
    'zoneWidth',
    'zone_width',
  ]);
  const speed = firstNumber(record, [
    'speed',
    'indicatorSpeed',
    'indicator_speed',
    'walkingSpeed',
    'walking_speed',
  ]);

  if (start === null || end === null || speed === null) {
    return null;
  }

  return {
    zoneStartPercent: normalizedPercent(start),
    zoneEndPercent: normalizedPercent(end),
    zoneWidthPercent: width === null
      ? Math.max(0, normalizedPercent(end) - normalizedPercent(start))
      : normalizedPercent(width),
    speed: Math.max(0, speed),
    label: firstString(record, ['label', 'manifestLabel', 'manifest_label']),
    rawJson: value,
  };
}

function mapParticipant(value: unknown): CombatLiveParticipantReadModel | null {
  const record = toRecord(value);

  if (!record) {
    return null;
  }

  const participantId = firstString(record, [
    'participantId',
    'participant_id',
    'id',
  ]);

  if (!participantId) {
    return null;
  }

  const displayName = firstString(record, [
    'displayName',
    'display_name',
    'name',
    'label',
  ]) ?? participantId;

  return {
    participantId,
    side: firstString(record, ['side', 'participantSide', 'participant_side']),
    displayName,
    statusKey: firstString(record, ['statusKey', 'status_key', 'status']),
    statusLabel: firstString(record, ['statusLabel', 'status_label']),
    currentHp: firstNumber(record, [
      'currentHp',
      'current_hp',
      'healthCurrent',
      'health_current',
      'hp',
    ]),
    maxHp: firstNumber(record, ['maxHp', 'max_hp', 'maxHealth', 'max_health']),
    heroId: firstString(record, ['heroId', 'hero_id']),
    opponentDefinitionId: firstString(record, [
      'opponentDefinitionId',
      'opponent_definition_id',
    ]),
    rawJson: value as Json,
  };
}

function mapEvent(value: unknown): CombatLiveEventReadModel | null {
  const record = toRecord(value);

  if (!record) {
    return null;
  }

  const index = firstNumber(record, ['eventIndex', 'event_index', 'index']);

  if (index === null) {
    return null;
  }

  const eventKind = firstString(record, ['eventKind', 'event_kind', 'kind'])
    ?? 'event';

  return {
    eventIndex: Math.floor(index),
    eventKind,
    label: firstString(record, ['label', 'displayText', 'display_text', 'message'])
      ?? humanizeKey(eventKind),
    actorParticipantId: firstString(record, [
      'actorParticipantId',
      'actor_participant_id',
    ]),
    targetParticipantId: firstString(record, [
      'targetParticipantId',
      'target_participant_id',
    ]),
    roundNumber: firstNumber(record, ['roundNumber', 'round_number']),
    actionIndex: firstNumber(record, ['actionIndex', 'action_index']),
    happenedAt: firstString(record, ['happenedAt', 'happened_at', 'createdAt', 'created_at']),
    details: eventDetails(record),
    rawJson: value as Json,
  };
}

function eventDetails(record: JsonRecord): string[] {
  const details = firstArray(record, ['details', 'detailRows', 'detail_rows']);

  if (details) {
    return details
      .map((entry) => typeof entry === 'string' ? entry : null)
      .filter((entry): entry is string => Boolean(entry));
  }

  return [
    firstString(record, ['summary', 'description']),
    firstString(record, ['outcomeLabel', 'outcome_label']),
  ].filter((entry): entry is string => Boolean(entry));
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function firstString(record: JsonRecord, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string') {
      const normalized = trimText(value);

      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function firstNumber(record: JsonRecord, keys: readonly string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    const normalized = typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

    if (Number.isFinite(normalized)) {
      return normalized;
    }
  }

  return null;
}

function firstArray(record: JsonRecord, keys: readonly string[]): unknown[] | null {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return null;
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for live combat workflow.`);
  }

  return normalized;
}

function optionalNonNegativeInteger(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Math.floor(Number(value));

  return Number.isFinite(normalized) && normalized >= 0 ? normalized : null;
}

function normalizedPercent(value: number): number {
  return Math.max(0, Math.min(100, Number(value)));
}

function humanizeKey(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || 'Event';
}
