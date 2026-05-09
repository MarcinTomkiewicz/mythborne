import {
  CombatLiveEventReadModel,
  CombatLiveParticipantReadModel,
  CombatLiveStateReadModel,
} from '../domain/combat/combat-live.model';
import { Json } from '../types/database.types';
import { mapJsonArray } from './json-read';
import { mapEvent } from './combat-live-event.mapper';
import { mapParticipant } from './combat-live-participant.mapper';
import { LiveStateRpcRow } from './combat-live-rpc-args.mapper';
import { mapTimingManifest } from './combat-timing-manifest.mapper';

export function mapCombatLiveState(row: LiveStateRpcRow): CombatLiveStateReadModel {
  const participants = mapJsonArray(row.participants_json, mapParticipant)
    .filter((entry): entry is CombatLiveParticipantReadModel => entry !== null);
  const events = mapJsonArray(row.events_json, mapEvent)
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
